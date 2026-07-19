import os
from azure.cosmos import CosmosClient, PartitionKey, exceptions

# 1. PARAMETRY POŁĄCZENIA - Podmień na swoje dane z Azure Keys
ENDPOINT = "https://cosmos-equitylens-prod.documents.azure.com:443/"
PRIMARY_KEY = "G8e6o3EtxsAbrVhPZe2A02vS9jwUDVUg20egRgEh0Dx8pq16q5HvV6fSxQL0kXDcedxAVVHRjgFBACDbvUqBXg=="

DATABASE_NAME = "db-equitylens"
CONTAINER_NAME = "financial-data"

def run_test():
    try:
        # 2. Inicjalizacja klienta chmurowego
        print("Łączenie z usługą Azure Cosmos DB...")
        client = CosmosClient(ENDPOINT, credential=PRIMARY_KEY)
        
        # 3. Pobranie referencji do bazy i kontenera
        database = client.get_database_client(DATABASE_NAME)
        container = database.get_container_client(CONTAINER_NAME)
        
        # 4. Przygotowanie testowego dokumentu JSON
        # Ważne: Musi zawierać pole 'id' (jako tekst) oraz klucz partycji, czyli 'symbol'
        test_item = {
            "id": "item_id_001",
            "symbol": "MSFT",
            "companyName": "Microsoft Corporation",
            "price": 420.50,
            "currency": "USD",
            "status": "Test connection successful!"
        }
        
        # 5. Zapis dokumentu w bazie danych Azure
        print(f"Próba zapisu dokumentu dla spółki {test_item['symbol']}...")
        container.upsert_item(body=test_item)
        print(" Sukces! Dokument został poprawnie zapisany w chmurze.")
        
    except exceptions.CosmosHttpResponseError as e:
        print(f" Wystąpił błąd Azure Cosmos: {e.message}")
    except Exception as e:
        print(f" Wystąpił niespodziewany błąd: {e}")

if __name__ == "__main__":
    run_test()