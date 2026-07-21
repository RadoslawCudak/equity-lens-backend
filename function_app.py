import azure.functions as func
import logging
import json
import os
import yfinance as yf
from azure.cosmos import CosmosClient, exceptions

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

COSMOS_ENDPOINT = os.environ.get("COSMOS_ENDPOINT")
COSMOS_KEY = os.environ.get("COSMOS_KEY")
DATABASE_NAME = "EquityLensDB"
CONTAINER_NAME = "Stocks"

def get_cosmos_container():
    if not COSMOS_ENDPOINT or not COSMOS_KEY:
        raise ValueError("Missing Cosmos DB credentials in environment variables.")
    client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
    database = client.get_database_client(DATABASE_NAME)
    return database.get_container_client(CONTAINER_NAME)

@app.route(route="stock-test", methods=['GET'])
def get_stock_data(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing request for stock data...')

    # Pobranie symbolu z parametru URL (domyślnie PKN.WA - ORLEN z GPW)
    symbol = req.params.get('symbol', 'PKN.WA').upper()

    try:
        # 1. Pobranie danych rynkowych z Yahoo Finance
        ticker = yf.Ticker(symbol)
        info = ticker.fast_info

        price = getattr(info, 'last_price', None)
        currency = getattr(info, 'currency', 'PLN')

        if price is None:
            return func.HttpResponse(
                json.dumps({"error": f"Could not fetch price for ticker: {symbol}"}),
                status_code=400,
                mimetype="application/json"
            )

        # 2. Przygotowanie obiektu do zapisu w Cosmos DB
        # Zamiana kropki na myślnik dla czytelnego ID (np. PKN-WA)
        doc_id = f"stock_{symbol.replace('.', '-')}"
        stock_document = {
            "id": doc_id,
            "symbol": symbol,
            "price": round(price, 2),
            "currency": currency,
            "status": "Fetched live data from Yahoo Finance!"
        }

        # 3. Zapis / Aktualizacja w Cosmos DB
        container = get_cosmos_container()
        container.upsert_item(stock_document)

        return func.HttpResponse(
            json.dumps(stock_document),
            status_code=200,
            mimetype="application/json"
        )

    except exceptions.CosmosHttpResponseError as e:
        logging.error(f"Cosmos DB error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Database error", "details": str(e)}),
            status_code=500,
            mimetype="application/json"
        )
    except Exception as e:
        logging.error(f"General error: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": "Failed to fetch stock data", "details": str(e)}),
            status_code=500,
            mimetype="application/json"
        )