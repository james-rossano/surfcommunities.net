import json

# Function to generate Google Maps URL 
def generate_google_maps_url(lat, lng):
    return f"https://www.google.com/maps/@{lat},{lng},16z"

# Function to generate Windy URL
def generate_windy_url(lat, lng):
    return f"https://www.windy.com/-Waves-waves?waves,{lat},{lng},15"

# Function to add forecast links to each surf spot
def add_forecast_links(surf_spots):
    for spot in surf_spots:
        lat = spot["coordinates"]["lat"]
        lng = spot["coordinates"]["lng"]

        # Add forecast links only if they don't already exist
        if spot.get("forecast") is None:
            spot["forecast"] = [
                {
                    "name": "Google Maps",
                    "url": generate_google_maps_url(lat, lng)
                },
                {
                    "name": "Windy",
                    "url": generate_windy_url(lat, lng)
                }
            ]
        else:
            # Update existing Google Maps forecast URL if present
            for forecast in spot["forecast"]:
                if forecast["name"] == "Windy":
                    forecast["url"] = generate_windy_url(lat, lng)
    return surf_spots

# Load the JSON data from output.json
input_file = 'output.json'

try:
    with open(input_file, 'r') as infile:
        surf_spots = json.load(infile)
except FileNotFoundError:
    print(f"Error: {input_file} not found.")
    exit()

# Add forecast links to the JSON data
updated_surf_spots = add_forecast_links(surf_spots)

# Save the updated JSON data back to the same file
with open(input_file, 'w') as outfile:
    json.dump(updated_surf_spots, outfile, indent=4)

print(f"Updated forecasts with the correct Google Maps links added to {input_file}.")
