import azure.functions as func
import logging
import json

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

@app.route(route="AnalyzeStocks")
def AnalyzeStocks(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Przetwarzanie zapytania o analizę giełdową.')

    # Symulacja bazy danych / zewnętrznego API giełdowego
    mock_market_data = [
        {"ticker": "AAPL", "company": "Apple Inc.", "pe_ratio": 28.5, "rsi": 45},
        {"ticker": "MSFT", "company": "Microsoft Corp.", "pe_ratio": 32.1, "rsi": 68},
        {"ticker": "NVDA", "company": "NVIDIA Corp.", "pe_ratio": 65.4, "rsi": 72},
        {"ticker": "TSLA", "company": "Tesla Inc.", "pe_ratio": 42.0, "rsi": 30}
    ]

    # Pobieramy maksymalny wskaźnik P/E (Cena/Zysk) przesłany przez użytkownika (np. z frontendu)
    # Jeśli użytkownik nic nie poda, domyślnie ustawiamy 40.0
    max_pe = req.params.get('max_pe')
    if not max_pe:
        try:
            req_body = req.get_json()
        except ValueError:
            pass
        else:
            max_pe = req_body.get('max_pe')

    if max_pe:
        try:
            max_pe_float = float(max_pe)
            # Filtrowanie danych według kryterium P/E
            filtered_data = [stock for stock in mock_market_data if stock["pe_ratio"] <= max_pe_float]
        except ValueError:
            return func.HttpResponse("Parametr max_pe musi być liczbą.", status_code=400)
    else:
        filtered_data = mock_market_data

    # Zwracamy przefiltrowane dane jako czysty JSON
    return func.HttpResponse(
        body=json.dumps(filtered_data, indent=4),
        mimetype="application/json",
        status_code=200
    )