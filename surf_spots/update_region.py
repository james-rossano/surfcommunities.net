import json
import os

# Define the path for all-regions.json
all_regions_file_path = os.path.abspath("all-regions.json")

# New region details (update these variables as needed)
new_region = {
    "name": "Delaware",  # Replace with the new region's name
    "country": "US",           # Replace with the country
    "region": "Delaware",     # Replace with the region/state
    "coordinates": [           # Replace with the bounding box coordinates
        {
            "point1": "38.83072187825255,-75.21775105625208",
            "point2": "38.444554426013106,-74.94997276401818"
        }
    ],
    "spotIDs": []              # Leave empty; this will be updated later if needed
}

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
with open(all_regions_file_path, "w") as all_regions_file:
    json.dump(all_regions_data, all_regions_file, indent=4)
    print(f"all-regions.json updated successfully at {all_regions_file_path}")

print("Region added or updated successfully.")