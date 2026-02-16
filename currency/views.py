from django.shortcuts import render
from .models import Currency
from .services import fetch_nbu_rates

from django.http import JsonResponse
from .services import fetch_nbu_rates

def currency_index(request):
    # Proactively update rates
    fetch_nbu_rates()
    
    currencies = Currency.objects.all().order_by('code')
    
    # Common currencies to highlight (USD, EUR, RUB) as per NBU style
    highlight_codes = ['USD', 'EUR', 'RUB', 'GBP', 'JPY', 'CHF', 'CNY', 'KZT']
    highlighted_raw = Currency.objects.filter(code__in=highlight_codes)
    highlighted = sorted(highlighted_raw, key=lambda x: highlight_codes.index(x.code))
    
    context = {
        'currencies': currencies,
        'highlighted': highlighted,
    }
    return render(request, 'currency/index.html', context)

def get_historical_rates(request):
    date = request.GET.get('date')
    if not date:
        return JsonResponse({'error': 'Date is required'}, status=400)
    
    data = fetch_nbu_rates(date=date)
    if data:
        return JsonResponse({'data': data})
    else:
        return JsonResponse({'error': 'Failed to fetch rates'}, status=500)
