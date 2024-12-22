import json
import os

# Define paths to ensure correct file access
regions_file_path = os.path.abspath("regions.json")
surf_spots_file_path = os.path.abspath("output.json")

# Load regions and surf spots data
with open(regions_file_path, "r") as regions_file:
    regions_data = json.load(regions_file)

with open(surf_spots_file_path, "r") as surf_spots_file:
    surf_spots_data = json.load(surf_spots_file)

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

# Process each region and update spotIDs with matching surf spots
for region in regions_data:
    region["spotIDs"] = []  # Reset spotIDs for fresh update

    # Check each surf spot to see if it falls within any bounding box of this region
    for spot in surf_spots_data:
        lat = spot["coordinates"]["lat"]
        lng = spot["coordinates"]["lng"]

        # If any bounding box for this region contains the surf spot, add it
        for box in region["coordinates"]:
            if is_within_bounding_box(lat, lng, box):
                # Add both name and ID to the region's spotIDs list
                region["spotIDs"].append({
                    "name": spot["name"],
                    "ID": spot["id"]
                })
                break  # Stop checking other boxes for this spot

# Save the updated regions data back to regions.json
with open(regions_file_path, "w") as regions_file:
    json.dump(regions_data, regions_file, indent=4)
    print(f"regions.json updated successfully at {regions_file_path}")

print("regions.json has been updated with surf spot IDs and formatted coordinates.")
