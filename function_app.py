import azure.functions as func
import logging
import json
import yfinance as yf
from azure.cosmos import CosmosClient, PartitionKey
import os

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# Pobieramy nazwy z konfiguracji lub używamy wartości domyślnych
COSMOS_ENDPOINT = os.environ.get("COSMOS_ENDPOINT")
COSMOS_KEY = os.environ.get("COSMOS_KEY")
DATABASE_NAME = os.environ.get("COSMOS_DATABASE", "db-equitylens")
CONTAINER_NAME = os.environ.get("COSMOS_CONTAINER", "financial-data")

@app.route(route="get_stock_data", methods=["GET"])
def get_stock_data(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing stock data request...')

    symbol = req.params.get('symbol')
    if not symbol:
        return func.HttpResponse(
            json.dumps({"error": "Please provide a 'symbol' query parameter (e.g., PKN.WA)"}),
            status_code=400,
            mimetype="application/json"
        )

    try:
        # 1. Pobieramy dane z Yahoo Finance
        ticker = yf.Ticker(symbol)
        raw_info = ticker.info

        if not raw_info or len(raw_info) <= 1:
            return func.HttpResponse(
                json.dumps({"error": f"No data found for symbol: {symbol}"}),
                status_code=444,
                mimetype="application/json"
            )

        # 2. Czyszczenie danych (Cosmos DB nie lubi wartości None/NaN ani typów nieobsługiwanych przez JSON)
        cleaned_info = {}
        for key, value in raw_info.items():
            if value is not None and str(value) != 'nan':
                cleaned_info[key] = value

        # Przygotowujemy dokument do bazy danych
        document = {
            "id": symbol.upper(),
            "symbol": symbol.upper(),
            "data": cleaned_info
        }

        # 3. Zapis do Cosmos DB (opcjonalnie, jeśli konfiguracja jest obecna)
        if COSMOS_ENDPOINT and COSMOS_KEY:
            try:
                client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
                db = client.get_database_client(DATABASE_NAME)
                container = db.get_container_client(CONTAINER_NAME)
                container.upsert_item(document)
            except Exception as db_err:
                logging.warning(f"Failed to save to Cosmos DB: {str(db_err)}")

        # 4. Zwracamy czysty JSON do Frontendu
        return func.HttpResponse(
            json.dumps(document, ensure_ascii=False, default=str),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Error occurred: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": f"Internal Server Error: {str(e)}"}),
            status_code=500,
            mimetype="application/json"
        )