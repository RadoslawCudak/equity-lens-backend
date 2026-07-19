import azure.functions as func
import json
import os
from azure.cosmos import CosmosClient

app = func.FunctionApp(http_auth_level=func.AuthLevel.ANONYMOUS)

# Pobieranie zmiennych z local.settings.json (lokalnie) lub Configuration (w Azure)
ENDPOINT = os.environ.get("COSMOS_ENDPOINT", "")
PRIMARY_KEY = os.environ.get("COSMOS_KEY", "")

@app.route(route="stock-test", methods=["GET"])
def get_stock_data(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # Inicjalizacja połączenia z bazą danych
        client = CosmosClient(ENDPOINT,credential=PRIMARY_KEY)
        database = client.get_database_client("db-equitylens")
        container = database.get_container_client("financial-data")
        
        # Proste zapytanie SQL wyciągające testowy rekord MSFT
        query = "SELECT * FROM c WHERE c.symbol = 'MSFT'"
        items = list(container.query_items(query=query, enable_cross_partition_query=True))
        
        return func.HttpResponse(
            body=json.dumps(items),
            status_code=200,
            mimetype="application/json"
        )
    except Exception as e:
        return func.HttpResponse(
            body=f"Błąd backendu: {str(e)}",
            status_code=500
        )