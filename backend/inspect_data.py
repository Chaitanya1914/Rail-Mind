import json, sys
sys.stdout.reconfigure(encoding='utf-8')

# Deeper dive into trains.json
with open('backend/data/trains.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

features = data['features']
print(f'Total train features: {len(features)}')
print(f'First feature keys: {list(features[0].keys())}')
print(f'First feature properties keys: {list(features[0]["properties"].keys())}')
print(f'First feature geometry type: {features[0]["geometry"]["type"]}')

# Show 2 full samples
for i in range(2):
    print(f'\n--- Train {i+1} ---')
    props = features[i]['properties']
    for k, v in props.items():
        val_str = str(v)[:100]
        print(f'  {k}: {val_str}')
    
    # Check geometry
    geom = features[i]['geometry']
    coords = geom.get('coordinates', [])
    if coords:
        print(f'  coordinates: {len(coords)} points')
        print(f'    first: {coords[0]}')
        print(f'    last: {coords[-1]}')

# Now stations
print('\n\n=== STATIONS ===')
with open('backend/data/stations.json', 'r', encoding='utf-8') as f:
    sdata = json.load(f)

stations = sdata['features']
print(f'Total stations: {len(stations)}')
print(f'First station properties: {list(stations[0]["properties"].keys())}')

for i in range(3):
    props = stations[i]['properties']
    coords = stations[i]['geometry']['coordinates']
    print(f'  {props.get("code","?")} - {props.get("name","?")} ({props.get("zone","?")}) @ {coords}')
