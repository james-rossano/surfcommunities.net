import sqlite3
import json
import os

DB_PATH = 'regions.db'         # Path to your SQLite database
JSON_PATH = 'regions.json'     # Path to your JSON file

def create_region(region_name):
    # Connect to the database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create table if not exists (adjust schema as needed)
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS regions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        )
    ''')

    # Insert new region
    cursor.execute('INSERT INTO regions (name) VALUES (?)', (region_name,))
    conn.commit()

    # Get the new region id
    region_id = cursor.lastrowid

    # Update JSON file
    if os.path.exists(JSON_PATH):
        with open(JSON_PATH, 'r') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                data = []
    else:
        data = []

    # Add new region to JSON (as a dict with id and name)
    data.append({'region-id': region_id, 'name': region_name})

    with open(JSON_PATH, 'w') as f:
        json.dump(data, f, indent=4)

    print(f"Region '{region_name}' created with id {region_id}.")

if __name__ == '__main__':
    region_name = input("Enter new region name: ")
    create_region(region_name)