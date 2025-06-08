import json

# Function to convert the first format to the second format
def convert_to_second_format(data):
    converted_data = []

    for spot in data:
        new_spot = {
            "id": spot.get("id"),
            "type": "Surf Spot",  # Default type
            "name": spot.get("name"),
            "coordinates": {
                "lat": float(spot.get("latitude", 0.0)),
                "lng": float(spot.get("longitude", 0.0))
            },
            "country": None,        # Default to None if not provided
            "region": None,         # Default to None if not provided
            "sub_region": None,     # Default to None if not provided
            "description": None,    # Default to None if not provided
            "forecast": None        # Default to None, can be populated if needed
        }
        converted_data.append(new_spot)

    return converted_data

# Read from input JSON file
def read_json_file(input_file):
    with open(input_file, 'r') as file:
        data = json.load(file)
    return data

# Write to output JSON file
def write_json_file(output_file, data):
    with open(output_file, 'w') as file:
        json.dump(data, file, indent=4)

# Main process to convert the input JSON and write to a new JSON file
def main():
    input_file = 'surf_spots/every_spot.json'  # Specify your input JSON file path
    output_file = 'output.json'  # Specify your output JSON file path

    # Read the input JSON file
    input_data = read_json_file(input_file)

    # Convert the data to the new format
    converted_data = convert_to_second_format(input_data)

    # Write the converted data to the output JSON file
    write_json_file(output_file, converted_data)

    print(f"Conversion completed. Data written to {output_file}")

# Run the main process
if __name__ == '__main__':
    main()