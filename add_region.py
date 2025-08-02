import sqlite3
import json

# Database file
db_file = "surf_data.db"
# JSON file
json_file = "surfspots.json"

# New region details
new_region = {
    "name": "North Sumatra",
    "country": "Indonesia",
    "greater-region": "",
    "coordinates": [
        {
            "point1": "-8.775412567704178, 111.73397921025754",
            "point2": "-5.754571401065229, 104.90048311650754"
        }
    ],
    "telegram-link": "",
}

# Function to parse formatted coordinate strings into floats
def parse_coordinates(coordinate_str):
    lat, lng = map(float, coordinate_str.split(","))
    return lat, lng

# Function to check if a surf spot is within a bounding box
def is_within_bounding_box(lat, lng, box):
    lat1, lng1 = parse_coordinates(box["point1"])
    lat2, lng2 = parse_coordinates(box["point2"])

    lat_min, lat_max = min(lat1, lat2), max(lat1, lat2)
    lng_min, lng_max = min(lng1, lng2), max(lng1, lng2)
    return lat_min <= lat <= lat_max and lng_min <= lng <= lng_max

# Add or update a region in the database
def update_region():
    with sqlite3.connect(db_file) as conn:
        cursor = conn.cursor()

        # Serialize coordinates to JSON
        serialized_coordinates = json.dumps(new_region["coordinates"])

        # Check if the region already exists
        cursor.execute(
            "SELECT `region-id` FROM regions WHERE name = ? AND country = ?",
            (new_region["name"], new_region["country"])
        )
        existing_region = cursor.fetchone()

        if existing_region:
            region_id = existing_region[0]
            print(f"Updating existing region with region-id {region_id}")
            cursor.execute(
                "UPDATE regions SET `greater-region`=?, coordinates=?, `telegram-link`=? WHERE `region-id`=?",
                (new_region["greater-region"], serialized_coordinates, new_region["telegram-link"], region_id)
            )
        else:
            cursor.execute(
                "INSERT INTO regions (name, country, `greater-region`, coordinates, `telegram-link`) VALUES (?, ?, ?, ?, ?)",
                (new_region["name"], new_region["country"], new_region["greater-region"], serialized_coordinates, new_region["telegram-link"])
            )
            region_id = cursor.lastrowid
            print(f"Inserted new region with region-id {region_id}")

        # Load surfspots.json
        with open(json_file, "r", encoding="utf-8") as f:
            surfspots = json.load(f)

        # Update region-id for matching spots
        updated_count = 0
        for spot in surfspots:
            lat = spot.get("latitude")
            lng = spot.get("longitude")
            if lat is None or lng is None:
                continue
            for box in new_region["coordinates"]:
                if is_within_bounding_box(lat, lng, box):
                    spot["region-id"] = region_id
                    updated_count += 1
                    break

        # Save updated surfspots.json
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(surfspots, f, indent=2)

        print(f"Updated {updated_count} surf spots with region-id {region_id}.")

# Initialize and update the database
if __name__ == "__main__":
    update_region()
    print("Region and surf spots updated successfully.")
