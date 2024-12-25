import json
import os

# Define the path for all-regions.json
all_regions_file_path = os.path.abspath("surf_spots/all-regions.json")

# New region details (update these variables as needed)
new_region = {
    "name": "Delaware",  # Replace with the new region's name
    "country": "US",           # Replace with the country
    "region": "Delaware",     # Replace with the region/state
    "coordinates": [           # Replace with the bounding box coordinates
        {
            "point1": "38.84569742993362, -75.22584960879202",
            "point2": "38.42519144933772, -74.92923365431753"
        }
    ],
    "spotIDs": []              # Leave empty; this will be updated later if needed
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

# Load surf spots data
try:
    with open("output.json", "r") as surf_spots_file:
        surf_spots_data = json.load(surf_spots_file)
except Exception as e:
    print(f"Error loading surf spots data: {e}")
    surf_spots_data = []

# Populate the spotIDs for the new region and update surf spots with region info
for spot in surf_spots_data:
    lat = spot["coordinates"]["lat"]
    lng = spot["coordinates"]["lng"]

    # If the spot falls within any bounding box of the new region, add it
    for box in new_region["coordinates"]:
        if is_within_bounding_box(lat, lng, box):
            # Add to the region's spotIDs
            new_region["spotIDs"].append({
                "name": spot["name"],
                "ID": spot["id"]
            })

            # Update surf spot with region info
            spot["country"] = new_region["country"]
            spot["region"] = new_region["region"]
            spot["sub_region"] = new_region["name"]

            break  # Stop checking other boxes for this spot

# Load all-regions.json
if os.path.exists(all_regions_file_path):
    with open(all_regions_file_path, "r") as all_regions_file:
        all_regions_data = json.load(all_regions_file)
else:
    all_regions_data = []

# Check if the region exists (by name and country)
region_found = False
for index, region in enumerate(all_regions_data):
    if region["name"] == new_region["name"] and region["country"] == new_region["country"]:
        # Replace the existing region
        all_regions_data[index] = new_region
        region_found = True
        break

# If the region does not exist, append it
if not region_found:
    all_regions_data.append(new_region)

# Save the updated regions data back to all-regions.json
try:
    with open(all_regions_file_path, "w") as all_regions_file:
        json.dump(all_regions_data, all_regions_file, indent=4)
        print(f"all-regions.json updated successfully at {all_regions_file_path}")
except Exception as e:
    print(f"Error writing to all-regions.json: {e}")

# Save the updated surf spots data back to the file
try:
    with open("output.json", "w") as surf_spots_file:
        json.dump(surf_spots_data, surf_spots_file, indent=4)
        print(f"Surf spots updated successfully at output.json")
except Exception as e:
    print(f"Error writing to surf spots file: {e}")

print("Region and surf spots updated successfully.")