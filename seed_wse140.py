import os
import json
import logging
import math
import yfinance as yf
from azure.cosmos import CosmosClient

# Updated and verified list of 140 active WSE (GPW) companies
WSE_TICKERS = [
    # WIG20
    "PKO.WA", "PEO.WA", "PKN.WA", "DNP.WA", "LPP.WA", "CDR.WA", "KGH.WA", "ALE.WA", "PZU.WA", "SAN.WA",
    "KRU.WA", "OPL.WA", "ALR.WA", "MBK.WA", "CPS.WA", "JSW.WA", "PGE.WA", "ACP.WA", "TPE.WA", "KTY.WA",
    
    # mWIG40
    "MIL.WA", "TEN.WA", "EAT.WA", "11B.WA", "ATT.WA", "BFT.WA", "CAR.WA", "CIE.WA", "CMR.WA", "DOM.WA",
    "ENA.WA", "EUR.WA", "GTC.WA", "ING.WA", "KER.WA", "LVC.WA", "NEU.WA", "TRK.WA", "XTB.WA", "APR.WA",
    "ASB.WA", "BDX.WA", "BHW.WA", "ECH.WA", "GPP.WA", "GPW.WA", "HUG.WA", "MOC.WA", "SLV.WA", "STH.WA",
    "VRG.WA", "WPL.WA", "ZEP.WA", "MAB.WA", "RBW.WA", "SNT.WA", "UNT.WA", "PLW.WA", "TXT.WA", "EFL.WA",

    # sWIG80 & Key Active GPW Companies
    "3RG.WA", "ABS.WA", "ACG.WA", "ACT.WA", "ADV.WA", "AGO.WA", "AAT.WA", "AMB.WA", "AMC.WA", "APT.WA",
    "ARH.WA", "ATC.WA", "ATD.WA", "ATG.WA", "ATP.WA", "ATS.WA", "BBT.WA", "BCX.WA", "BOW.WA", "BOS.WA",
    "BRS.WA", "BST.WA", "BZW.WA", "CAP.WA", "CAV.WA", "CIG.WA", "COG.WA", "CPG.WA", "CPR.WA", "CRJ.WA",
    "CTS.WA", "DAT.WA", "DEL.WA", "DGA.WA", "DCR.WA", "TOR.WA", "DTR.WA", "EHG.WA", "EKP.WA", "ELB.WA",
    "ELT.WA", "ENP.WA", "ERB.WA", "FOR.WA", "FTE.WA", "GEN.WA", "GKI.WA", "HEL.WA", "HER.WA", "IMS.WA",
    "INC.WA", "INP.WA", "IAG.WA", "IZO.WA", "JWW.WA", "KCH.WA", "KGN.WA", "KME.WA", "KOM.WA", "KPD.WA",
    "VGO.WA", "LTS.WA", "MCI.WA", "MDG.WA", "MEG.WA", "MCL.WA", "MON.WA", "NTU.WA", "ODL.WA", "OAT.WA",
    "PCR.WA", "SNK.WA", "PRI.WA", "PTH.WA", "SWG.WA", "MOC.WA", "SES.WA", "SHD.WA", "SKH.WA", "VOX.WA"
]


def load_local_settings():
    """Loads environment variables directly from local.settings.json if available."""
    settings_path = os.path.join(os.path.dirname(__file__), "local.settings.json")
    if os.path.exists(settings_path):
        try:
            with open(settings_path, "r", encoding="utf-8") as f:
                settings = json.load(f)
                values = settings.get("Values", {})
                for key, val in values.items():
                    if key not in os.environ:
                        os.environ[key] = str(val)
            print("Loaded configuration from local.settings.json")
        except Exception as e:
            print(f"Failed to load local.settings.json: {str(e)}")


def seed_database():
    """Batch updates and seeds Cosmos DB with financial data for all 140 WSE tickers."""
    load_local_settings()

    endpoint = os.environ.get("COSMOS_ENDPOINT")
    key = os.environ.get("COSMOS_KEY")
    db_name = os.environ.get("COSMOS_DATABASE", "db-equitylens")
    container_name = os.environ.get("COSMOS_CONTAINER", "financial-data")

    if not endpoint or not key:
        print("Error: Missing COSMOS_ENDPOINT or COSMOS_KEY configuration.")
        return

    client = CosmosClient(endpoint, key)
    db = client.get_database_client(db_name)
    container = db.get_container_client(container_name)

    print(f"Starting database seed process for {len(WSE_TICKERS)} WSE companies...\n")

    success_count = 0
    fail_count = 0

    for idx, symbol in enumerate(WSE_TICKERS, 1):
        try:
            print(f"[{idx}/{len(WSE_TICKERS)}] Fetching data for {symbol}...")
            ticker = yf.Ticker(symbol)
            raw_info = ticker.info

            if not raw_info or len(raw_info) <= 1:
                print(f"   ⚠️ Skipping {symbol}: No data returned from Yahoo Finance.")
                fail_count += 1
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
            print(f"   ✅ Successfully saved {symbol}")
            success_count += 1

        except Exception as e:
            print(f"   ❌ Failed to process {symbol}: {str(e)}")
            fail_count += 1

    print("\n--------------------------------------------------")
    print(f"Database Seeding Completed!")
    print(f"Successfully processed: {success_count} companies")
    print(f"Failed / Skipped: {fail_count} companies")
    print("--------------------------------------------------")


if __name__ == "__main__":
    seed_database()