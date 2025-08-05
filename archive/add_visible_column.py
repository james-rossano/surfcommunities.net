import json
import os

json_file = "surfspots.json"

def set_json_visibility():
    if not os.path.exists(json_file):
        print(f"{json_file} not found.")
        return
    with open(json_file, "r", encoding="utf-8") as f:
        surfspots = json.load(f)
    updated_true = 0
    updated_false = 0
    for spot in surfspots:
        if spot.get("region-id") is not None:
            spot["visible"] = True
            updated_true += 1
        else:
            spot["visible"] = False
            updated_false += 1
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(surfspots, f, indent=2)
    print(f"Set 'visible': true for {updated_true} spots, false for {updated_false} spots in {json_file}.")

if __name__ == "__main__":
    set_json_visibility()