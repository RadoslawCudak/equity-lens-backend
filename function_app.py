import azure.functions as func
import logging
import json
import math
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
    """Fetch financial data and historical pricing for a specific stock ticker."""
    logging.info('Processing single stock data request...')
    global GPW_METADATA_CACHE

    # Reload metadata if cache is empty (e.g., following a cold start)
    if not GPW_METADATA_CACHE:
        load_gpw_metadata_cache()

    # Flexible parameter extraction: Accept 'symbol' or 'ticker' from query string or request body
    symbol_param = req.params.get('symbol') or req.params.get('ticker')
    if not symbol_param:
        try:
            req_body = req.get_json()
            symbol_param = req_body.get('symbol') or req_body.get('ticker')
        except Exception:
            pass

    if not symbol_param:
        return func.HttpResponse(
            json.dumps({"error": "Please provide a 'symbol' or 'ticker' query parameter"}),
            status_code=400,
            mimetype="application/json"
        )

    symbol_upper = symbol_param.upper()

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

        # 2. Fetch price history for chart (3 years) with strict NaN filtering
        hist_df = ticker.history(period="3y")
        price_history = []
        if not hist_df.empty:
            for date, row in hist_df.iterrows():
                close_val = row.get('Close')
                # Filter out None, 'nan' string, and float NaN values
                if close_val is not None and str(close_val) != 'nan':
                    try:
                        val_float = float(close_val)
                        if not math.isnan(val_float):
                            price_history.append({
                                "date": str(date)[:10],
                                "price": round(val_float, 2)
                            })
                    except (ValueError, TypeError):
                        continue

        # 3. Data cleansing for storage and serialization (Strict NaN filtration)
        cleaned_info = {}
        for key, value in raw_info.items():
            if value is None or str(value) == 'nan':
                continue
            if isinstance(value, float) and math.isnan(value):
                continue
            cleaned_info[key] = value

        # Map key metrics for frontend consumption
        cleaned_info["targetMin"] = raw_info.get("targetMinPrice")
        cleaned_info["targetMean"] = raw_info.get("targetMeanPrice")
        cleaned_info["targetMedian"] = raw_info.get("targetMedianPrice")
        cleaned_info["targetMax"] = raw_info.get("targetHighPrice")
        cleaned_info["dividendRate"] = raw_info.get("dividendRate") or raw_info.get("dividendPerShare")
        cleaned_info["freeFloat"] = raw_info.get("floatShares") or raw_info.get("freeFloat")

        # Attach cleaned priceHistory array
        cleaned_info["priceHistory"] = price_history

        # 4. Match metadata from RAM (Cosmos DB gpw-metadata)
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

        # 5. Upsert document to primary database container (financial-data)
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


@app.route(route="get_wse_stocks", methods=["GET"])
def get_wse_stocks(req: func.HttpRequest) -> func.HttpResponse:
    """Retrieves all stored WSE stock records directly from Cosmos DB."""
    logging.info('Processing WSE 140 stock list request...')

    if not COSMOS_ENDPOINT or not COSMOS_KEY:
        logging.error("Cosmos DB credentials missing.")
        return func.HttpResponse(
            json.dumps({"error": "Cosmos DB credentials are not configured"}),
            status_code=500,
            mimetype="application/json"
        )

    try:
        client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
        db = client.get_database_client(DATABASE_NAME)
        container = db.get_container_client(CONTAINER_DATA)

        # Query all cached stock documents from primary container
        query = "SELECT * FROM c"
        items = list(container.query_items(query=query, enable_cross_partition_query=True))

        return func.HttpResponse(
            json.dumps(items, ensure_ascii=False, default=str),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Failed to fetch WSE stock list: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": f"Internal Server Error: {str(e)}"}),
            status_code=500,
            mimetype="application/json"
        )


@app.route(route="refresh_wse_stocks", methods=["POST"])
def refresh_wse_stocks(req: func.HttpRequest) -> func.HttpResponse:
    """Triggers dynamic batch refresh for all stock records stored in Cosmos DB."""
    logging.info("Starting dynamic batch refresh for stored WSE stocks...")

    if not COSMOS_ENDPOINT or not COSMOS_KEY:
        logging.error("Cosmos DB credentials missing for refresh function.")
        return func.HttpResponse(
            json.dumps({"error": "Cosmos DB credentials are not configured"}),
            status_code=500,
            mimetype="application/json"
        )

    try:
        client = CosmosClient(COSMOS_ENDPOINT, COSMOS_KEY)
        db = client.get_database_client(DATABASE_NAME)
        container = db.get_container_client(CONTAINER_DATA)

        # 1. Dynamically fetch all existing symbols/tickers stored in Cosmos DB
        query = "SELECT c.symbol FROM c"
        stored_items = list(container.query_items(query=query, enable_cross_partition_query=True))

        # Extract unique symbols from Cosmos DB documents
        symbols_to_refresh = [item["symbol"] for item in stored_items if item.get("symbol")]

        if not symbols_to_refresh:
            return func.HttpResponse(
                json.dumps({"message": "No stored stocks found in Cosmos DB to refresh."}),
                status_code=200,
                mimetype="application/json"
            )

        logging.info(f"Found {len(symbols_to_refresh)} stocks in Cosmos DB. Fetching updates from Yahoo Finance...")

        updated_count = 0

        # 2. Iterate dynamically over stored tickers
        for symbol in symbols_to_refresh:
            try:
                ticker = yf.Ticker(symbol)
                raw_info = ticker.info

                if not raw_info or len(raw_info) <= 1:
                    continue

                # Clean NaN and invalid float values
                cleaned_info = {}
                for k, v in raw_info.items():
                    if v is None or str(v) == 'nan':
                        continue
                    if isinstance(v, float) and math.isnan(v):
                        continue
                    cleaned_info[k] = v

                cleaned_info["dividendRate"] = raw_info.get("dividendRate") or raw_info.get("dividendPerShare")
                cleaned_info["freeFloat"] = raw_info.get("floatShares") or raw_info.get("freeFloat")

                document = {
                    "id": symbol,
                    "symbol": symbol,
                    "index": "GPW",
                    "isin": cleaned_info.get("isin", "N/A"),
                    "official_name": cleaned_info.get("longName", symbol),
                    "data": cleaned_info
                }

                container.upsert_item(document)
                updated_count += 1
            except Exception as inner_e:
                logging.warning(f"Failed to refresh {symbol}: {str(inner_e)}")

        return func.HttpResponse(
            json.dumps({"message": f"Successfully updated {updated_count} WSE stocks."}),
            status_code=200,
            mimetype="application/json"
        )

    except Exception as e:
        logging.error(f"Error during refresh execution: {str(e)}")
        return func.HttpResponse(
            json.dumps({"error": f"Internal Server Error: {str(e)}"}),
            status_code=500,
            mimetype="application/json"
        )