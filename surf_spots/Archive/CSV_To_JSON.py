import pandas as pd
import json

# Load the CSV file
csv_path = "surf_spots/new_jersey_spots.csv"  # Adjust path if necessary
df = pd.read_csv(csv_path)

# Convert the DataFrame to JSON format based on your desired structure
spots_json = df.apply(lambda row: {
    "type": row["Type"].strip() if pd.notna(row["Type"]) else "Surf Spot",
    "name": row["Name"].strip() if pd.notna(row["Name"]) else None,
    "coordinates": {row["Name"].strip() if pd.notna(row["Latitude"]) else None,
        row["Name"].strip() if pd.notna(row["Longitude"]) else None
    }
    "country": row["Country"].strip() if pd.notna(row["Country"]) else None,
    "region": row["Region"].strip() if pd.notna(row["Region"]) else None,
    "sub_region": row["Sub-Region"].strip() if pd.notna(row["Sub-Region"]) else None,
    "description": row["Description"].strip() if pd.notna(row["Description"]) else None,
    "forecast": [
        {"name": forecast.split(", ")[0], "url": forecast.split(", ")[1]} 
        if pd.notna(forecast) and ", " in forecast else None
        for forecast in [row["Forecast 1"], row["Forecast 2"], row["Forecast 3"], row["Forecast 4"]]
    ]
}, axis=1).tolist()

# Clean up the forecast list by removing None values
for spot in spots_json:
    spot["forecast"] = [f for f in spot["forecast"] if f]

# Save the output to a JSON file
json_output_path = "surf_spots.json"
with open(json_output_path, "w") as f:
    json.dump(spots_json, f, indent=4)

print(f"JSON file created successfully: {json_output_path}")
