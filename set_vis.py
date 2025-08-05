import json
import os
import sys

json_file = "surfspots.json"

def set_visibility_by_region(region_id, visible):
    if not os.path.exists(json_file):
        print(f"{json_file} not found.")
        return
    with open(json_file, "r", encoding="utf-8") as f:
        surfspots = json.load(f)
    updated = 0
    for spot in surfspots:
        if spot.get("region-id") == region_id:
            spot["visible"] = visible
            updated += 1
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(surfspots, f, indent=2)
    print(f"Set 'visible': {visible} for {updated} spots with region-id {region_id} in {json_file}.")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python set_vis.py <true|false> <region-id>")
        sys.exit(1)
    try:
        region_id = int(sys.argv[2])
    except ValueError:
        print("region-id must be an integer.")
        sys.exit(1)
    visible_arg = sys.argv[1].lower()
    if visible_arg == "true":
        visible = True
    elif visible_arg == "false":
        visible = False
    else:
        print("Visibility must be 'true' or 'false'.")
        sys.exit(1)
    set_visibility_by_region(region_id, visible)