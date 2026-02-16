import requests
from .models import Currency


def _to_float(x):
    """
    Safe float converter:
    - None / "" -> None
    - "12,34" -> 12.34
    - "12.34" -> 12.34
    """
    if x is None:
        return None
    if isinstance(x, (int, float)):
        return float(x)

    s = str(x).strip()
    if not s:
        return None
    s = s.replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def fetch_nbu_rates(date=None):
    # Primary URL (NBU)
    nbu_url = "https://nbu.uz/en/exchange-rates/json/"
    if date:
        nbu_url += f"?date={date}"

    # Fallback URL (CBU)
    cbu_url = "https://cbu.uz/ru/arkhiv-kursov-valyut/json/"
    if date:
        cbu_url = f"https://cbu.uz/ru/arkhiv-kursov-valyut/json/all/{date}/"

    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
    }

    data = []

    # 1) Try NBU
    try:
        r = requests.get(nbu_url, headers=headers, timeout=10)
        if r.status_code == 200:
            data = r.json()
        else:
            raise Exception(f"NBU status {r.status_code}")
    except Exception as e:
        print(f"NBU API failed ({e}), trying CBU...")

        # 2) Fallback to CBU
        try:
            r = requests.get(cbu_url, headers=headers, timeout=10)
            r.raise_for_status()
            data = r.json()
        except Exception as e2:
            print(f"CBU API failed: {e2}")
            # MUHIM: None emas, bo‘sh list qaytaramiz
            return []

    # 3) Update DB only for latest (no date)
    if not date and isinstance(data, list):
        for item in data:
            # Detect format
            if isinstance(item, dict) and ("code" in item):  # NBU
                code = item.get("code")
                name = item.get("title")
                cb_price = item.get("cb_price")
                buy_price = item.get("nbu_buy_price")
                sell_price = item.get("nbu_cell_price")
            else:  # CBU
                code = item.get("Ccy")
                name = item.get("CcyNm_RU") or item.get("CcyNm_UZ") or item.get("CcyNm_EN")
                cb_price = item.get("Rate")
                buy_price = cb_price
                sell_price = cb_price

            if not code:
                continue

            Currency.objects.update_or_create(
                code=code,
                defaults={
                    "name": name or code,
                    "cb_price": _to_float(cb_price),
                    "buy_price": _to_float(buy_price),
                    "sell_price": _to_float(sell_price),
                },
            )

    return data if isinstance(data, list) else []
