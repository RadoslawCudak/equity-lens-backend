import azure.functions as func
import logging
import json
import yfinance as yf
from azure.cosmos import CosmosClient
import os

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# Environment configuration
COSMOS_ENDPOINT = os.environ.get("COSMOS_ENDPOINT")
COSMOS_KEY = os.environ.get("COSMOS_KEY")
DATABASE_NAME = os.environ.get("COSMOS_DATABASE", "db-equitylens")
CONTAINER_DATA = os.environ.get("COSMOS_CONTAINER", "financial-data")
CONTAINER_METADATA = "gpw-metadata"

# In-memory cache for GPW metadata
GPW_METADATA_CACHE = {}

def load_gpw_metadata_cache():
    """Fetches all metadata from Cosmos DB and stores it in RAM during function runtime."""
    global GPW_METADATA_CACHE
    if not COSMOS_ENDPOINT or not COSMOS_KEY:
        return

    try:
        logging.info("Loading GPW metadata cache from Cosmos DB...")
        client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
        db = client.get_database_client(DATABASE_NAME)
        meta_container = db.get_container_client(CONTAINER_METADATA)

        items = list(meta_container.read_all_items())
        GPW_METADATA_CACHE = {item["symbol"]: item for item in items}
        logging.info(f"Successfully loaded metadata for {len(GPW_METADATA_CACHE)} companies into RAM.")
    except Exception as e:
        logging.error(f"Error while loading GPW metadata: {str(e)}")

# Execute once during service instance startup
load_gpw_metadata_cache()

@app.route(route="get_stock_data", methods=["GET"])
def get_stock_data(req: func.HttpRequest) -> func.HttpResponse:
    logging.info('Processing stock data request...')
    global GPW_METADATA_CACHE

    # Reload metadata if cache is empty (e.g., following a cold start)
    if not GPW_METADATA_CACHE:
        load_gpw_metadata_cache()

    symbol = req.params.get('symbol')
    if not symbol:
        return func.HttpResponse(
            json.dumps({"error": "Please provide a 'symbol' query parameter"}),
            status_code=400,
            mimetype="application/json"
        )

    symbol_upper = symbol.upper()

    try:
        # 1. Fetch data from Yahoo Finance
        ticker = yf.Ticker(symbol_upper)
        raw_info = ticker.info

        if not raw_info or len(raw_info) <= 1:
            return func.HttpResponse(
                json.dumps({"error": f"No data found for symbol: {symbol_upper}"}),
                status_code=404,
                mimetype="application/json"
            )

        # 2. Data cleansing for Cosmos DB storage
        cleaned_info = {}
        for key, value in raw_info.items():
            if value is not None and str(value) != 'nan':
                cleaned_info[key] = value

        # 3. Match metadata from RAM (Cosmos DB gpw-metadata)
        metadata = GPW_METADATA_CACHE.get(symbol_upper, {
            "index": "Other / Non-GPW",
            "isin": cleaned_info.get("isin", "N/A"),
            "name": cleaned_info.get("longName", symbol_upper)
        })

        # Inject index, ISIN, and official company name directly into the info dictionary
        cleaned_info["gpw_index"] = metadata.get("index", "Other")
        cleaned_info["gpw_isin"] = metadata.get("isin", "N/A")
        cleaned_info["official_name"] = metadata.get("name", cleaned_info.get("longName"))

        document = {
            "id": symbol_upper,
            "symbol": symbol_upper,
            "index": cleaned_info["gpw_index"],
            "isin": cleaned_info["gpw_isin"],
            "data": cleaned_info
        }

        # 4. Save/Upsert document to primary database container (financial-data)
        if COSMOS_ENDPOINT and COSMOS_KEY:
            try:
                client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
                db = client.get_database_client(DATABASE_NAME)
                container = db.get_container_client(CONTAINER_DATA)
                container.upsert_item(document)
            except Exception as db_err:
                logging.warning(f"Failed to save to Cosmos DB: {str(db_err)}")

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