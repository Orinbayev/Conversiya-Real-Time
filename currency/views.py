from django.shortcuts import render
from django.http import JsonResponse, HttpResponse

from .models import Currency
from .services import fetch_nbu_rates


def currency_index(request):
    # Render health checks can send HEAD requests — don't do heavy work then
    if request.method == "HEAD":
        return HttpResponse("ok")

    # Proactively update rates, but NEVER break page on API failure
    try:
        fetch_nbu_rates()  # updates DB for latest rates
    except Exception as e:
        # log only; page must still work
        print(f"fetch_nbu_rates() failed: {e}")

    currencies = Currency.objects.all().order_by("code")

    highlight_codes = ["USD", "EUR", "RUB", "GBP", "JPY", "CHF", "CNY", "KZT"]
    highlighted_raw = Currency.objects.filter(code__in=highlight_codes)
    highlighted = sorted(highlighted_raw, key=lambda x: highlight_codes.index(x.code))

    context = {
        "currencies": currencies,
        "highlighted": highlighted,
    }
    return render(request, "currency/index.html", context)


def get_historical_rates(request):
    # HEAD safe (optional)
    if request.method == "HEAD":
        return HttpResponse("ok")

    date = request.GET.get("date")
    if not date:
        return JsonResponse({"error": "Date is required"}, status=400)

    try:
        data = fetch_nbu_rates(date=date)  # should return list
        # IMPORTANT: empty list is valid (not an error)
        return JsonResponse({"data": data}, status=200)
    except Exception as e:
        print(f"Historical fetch failed: {e}")
        return JsonResponse({"error": "Failed to fetch rates"}, status=500)
