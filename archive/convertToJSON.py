import sqlite3
import json

DB_FILE = "surfcommunity.db"
OUTPUT_JSON = "surfspots.json"

def export_spots():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, latitude, longitude FROM surfspots")
    spots = []
    for row in cursor.fetchall():
        spot = {
            "id": row[0],
            "name": row[1],
            "latitude": row[2],
            "longitude": row[3]
        }
        spots.append(spot)
    conn.close()

    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(spots, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    export_spots()
    print(f"Exported surf spots to {OUTPUT_JSON}")