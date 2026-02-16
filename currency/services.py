import requests
from .models import Currency

def fetch_nbu_rates(date=None):
    # Primary URL (NBU)
    nbu_url = "https://nbu.uz/en/exchange-rates/json/"
    if date:
        nbu_url += f"?date={date}"
    
    # Fallback URL (CBU)
    cbu_url = "https://cbu.uz/ru/arkhiv-kursov-valyut/json/"
    if date:
        # CBU historical format: https://cbu.uz/ru/arkhiv-kursov-valyut/json/all/YYYY-MM-DD/
        cbu_url = f"https://cbu.uz/ru/arkhiv-kursov-valyut/json/all/{date}/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    try:
        data = []
        try:
            response = requests.get(nbu_url, headers=headers, timeout=10)
            if response.status_code == 200:
                data = response.json()
            else:
                raise Exception(f"NBU status {response.status_code}")
        except Exception as e:
            print(f"NBU API failed ({e}), trying CBU...")
            response = requests.get(cbu_url, timeout=10)
            response.raise_for_status()
            data = response.json()

        if not date:
            # Only update database for the latest rates
            for item in data:
                # Check if it's NBU format or CBU format
                if 'code' in item: # NBU
                    code = item.get('code')
                    name = item.get('title')
                    cb_price = item.get('cb_price')
                    buy_price = item.get('nbu_buy_price')
                    sell_price = item.get('nbu_cell_price')
                else: # CBU
                    code = item.get('Ccy')
                    name = item.get('CcyNm_RU')
                    cb_price = item.get('Rate')
                    # Use CB rate as fallback for Buy/Sell if unavailable
                    buy_price = cb_price
                    sell_price = cb_price

                # Update or create currency record
                Currency.objects.update_or_create(
                    code=code,
                    defaults={
                        'name': name,
                        'cb_price': float(cb_price) if cb_price else None,
                        'buy_price': float(buy_price) if buy_price else None,
                        'sell_price': float(sell_price) if sell_price else None,
                    }
                )
        return data # Return results for AJAX
    except Exception as e:
        print(f"Error fetching rates: {e}")
        return None
