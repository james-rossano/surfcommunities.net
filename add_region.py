import sqlite3
import json

# Database file
db_file = "surfcommunity.db"

# New region details
new_region = {
    "name": "Olympic Coast",
    "country": "US",
    "region": "OR",
    "coordinates": [
        {
            "point1": "47.82126957575633, -122.46412977479824",
            "point2": "48.68443293102328, -124.9688867236938"
        }
    ]
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

# Ensure the regions table has the required structure
def init_regions_table():
    with sqlite3.connect(db_file) as conn:
        cursor = conn.cursor()
        # Check if `spotIDs` column exists
        cursor.execute("PRAGMA table_info(regions)")
        columns = [col[1] for col in cursor.fetchall()]
        if "spotIDs" not in columns:
            print("Adding 'spotIDs' column to the regions table...")
            cursor.execute("ALTER TABLE regions ADD COLUMN spotIDs TEXT")

# Add or update a region in the database
def update_region():
    with sqlite3.connect(db_file) as conn:
        cursor = conn.cursor()

        # Serialize coordinates to JSON
        serialized_coordinates = json.dumps(new_region["coordinates"])

        # Check if the region already exists
        cursor.execute(
            "SELECT id FROM regions WHERE name = ? AND country = ?",
            (new_region["name"], new_region["country"])
        )
        existing_region = cursor.fetchone()

        if existing_region:
            # Replace the existing region
            cursor.execute(
                "UPDATE regions SET region = ?, coordinates = ?, spotIDs = ? WHERE id = ?",
                (new_region["region"], serialized_coordinates, '[]', existing_region[0])
            )
            region_id = existing_region[0]
        else:
            # Insert the new region
            cursor.execute(
                "INSERT INTO regions (name, country, region, coordinates, spotIDs) VALUES (?, ?, ?, ?, ?)",
                (new_region["name"], new_region["country"], new_region["region"], serialized_coordinates, '[]')
            )
            region_id = cursor.lastrowid

        # Reset spotIDs for the region
        spotIDs = []

        # Fetch all surf spots
        cursor.execute("SELECT id, name, latitude, longitude FROM surfspots")
        surf_spots = cursor.fetchall()

        for spot_id, name, lat, lng in surf_spots:
            # Check if the spot falls within the region
            for box in new_region["coordinates"]:
                if is_within_bounding_box(lat, lng, box):
                    # Add to spotIDs
                    spotIDs.append({"name": name, "ID": spot_id})
                    # Update the spot with region info
                    cursor.execute(
                        "UPDATE surfspots SET country = ?, region = ?, sub_region = ? WHERE id = ?",
                        (new_region["country"], new_region["region"], new_region["name"], spot_id)
                    )
                    break

        # Update the region with populated spotIDs
        cursor.execute(
            "UPDATE regions SET spotIDs = ? WHERE id = ?",
            (json.dumps(spotIDs), region_id)
        )

        # Debug: Print populated spot IDs
        print("Spot IDs populated for region:", spotIDs)

# Initialize and update the database
if __name__ == "__main__":
    init_regions_table()
    update_region()
    print("Region and surf spots updated successfully.")
