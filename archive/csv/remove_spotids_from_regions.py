import csv

input_file = "C:/Users/jross/Documents/surfcommunity.net/csv/regions.csv"
output_file = "regions_no_spotids.csv"

with open(input_file, newline='', encoding='utf-8') as infile, \
     open(output_file, 'w', newline='', encoding='utf-8') as outfile:
    reader = csv.DictReader(infile)
    # Exclude the 'spotIDs' column
    fieldnames = [fn for fn in reader.fieldnames if fn.lower() != 'spotids']
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)
    writer.writeheader()
    for row in reader:
        row.pop('spotIDs', None)
        writer.writerow(row)

print(f"Written {output_file} without spotIDs column.")