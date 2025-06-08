
import sqlite3
import json

def parse_coords(coord_str):
    lat, lng = map(float, coord_str.strip().split(","))
    return lat, lng

def in_box(lat, lng, box):
    lat1, lng1 = parse_coords(box["point1"])
    lat2, lng2 = parse_coords(box["point2"])
    return (min(lat1, lat2) <= lat <= max(lat1, lat2)) and (min(lng1, lng2) <= lng <= max(lng1, lng2))

db_file = "surfcommunity.db"

with sqlite3.connect(db_file) as conn:
    cursor = conn.cursor()

    # Ensure telegram_link column exists
    cursor.execute("PRAGMA table_info(surfspots)")
    columns = [col[1] for col in cursor.fetchall()]
    if "telegram_link" not in columns:
        cursor.execute("ALTER TABLE surfspots ADD COLUMN telegram_link TEXT")

    # Load all regions from the regions table
    cursor.execute("SELECT name, country, region, `telegram-link`, coordinates FROM regions")
    regions = cursor.fetchall()

    parsed_regions = []
    for name, country, region_name, telegram, coord_json in regions:
        try:
            boxes = json.loads(coord_json)
            parsed_regions.append({
                "name": name,
                "country": country,
                "region": region_name,
                "telegram": telegram,
                "boxes": boxes
            })
        except Exception as e:
            print(f"Skipping region with invalid coordinates: {name}")

    # Load all surf spots with missing region info
    cursor.execute("SELECT id, name, latitude, longitude FROM surfspots WHERE country IS NULL OR region IS NULL OR sub_region IS NULL")
    spots = cursor.fetchall()

    for spot_id, name, lat, lng in spots:
        matched = False
        for region in parsed_regions:
            for box in region["boxes"]:
                if in_box(lat, lng, box):
                    cursor.execute(
                        "UPDATE surfspots SET country = ?, region = ?, sub_region = ?, telegram_link = ? WHERE id = ?",
                        (region["country"], region["region"], region["name"], region["telegram"], spot_id)
                    )
                    print(f"Updated spot: {name} with region {region['name']}")
                    matched = True
                    break
            if matched:
                break
        if not matched:
            print(f"No region match for spot: {name}")

    conn.commit()
