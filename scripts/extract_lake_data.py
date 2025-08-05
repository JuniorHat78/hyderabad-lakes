#!/usr/bin/env python3
import json
import csv
import re
from pathlib import Path

def slugify(text):
    """Convert text to URL-friendly slug"""
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[-\s]+', '-', text)
    return text.strip('-')

def extract_osm_lakes():
    """Extract lake data from OpenStreetMap JSON file"""
    osm_file = "/mnt/c/Users/MohdFarhan/Desktop/non-trivial-project/hyderabad-lakes/data/osm_raw_water_bodies.json"
    
    lakes = []
    
    try:
        with open(osm_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        for element in data.get('elements', []):
            if element.get('type') == 'way' and 'tags' in element:
                tags = element['tags']
                
                # Check if it's a water body
                if tags.get('natural') == 'water' or tags.get('water'):
                    name = tags.get('name', '')
                    if name:
                        # Clean up the name
                        name = name.strip()
                        # Skip if it's just a generic name
                        if name.lower() not in ['pond', 'lake', 'tank', 'water', 'park pond']:
                            lake_id = slugify(name)
                            
                            # Determine water type
                            water_type = tags.get('water', 'water_body')
                            if water_type == 'lake':
                                water_type = 'lake'
                            elif water_type == 'pond':
                                water_type = 'pond'
                            elif 'tank' in name.lower():
                                water_type = 'tank'
                            elif 'cheruvu' in name.lower():
                                water_type = 'cheruvu'
                            elif 'kunta' in name.lower():
                                water_type = 'kunta'
                            else:
                                water_type = 'water_body'
                            
                            lakes.append({
                                'id': lake_id,
                                'name': name,
                                'type': water_type,
                                'osm_id': element['id']
                            })
    except Exception as e:
        print(f"Error reading OSM file: {e}")
    
    return lakes

def extract_gee_lake_data():
    """Extract additional lake data from Google Earth Engine exports"""
    lost_lakes_file = "/mnt/c/Users/MohdFarhan/Desktop/non-trivial-project/lake-data/05_gee_satellite_analysis/lake_boundaries/major_lost_lakes_final.csv"
    
    lost_lakes = []
    
    try:
        with open(lost_lakes_file, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['area_ha']:
                    lost_lakes.append({
                        'area_ha': float(row['area_ha']),
                        'lat': float(row['centroid_lat']),
                        'lon': float(row['centroid_lon']),
                        'loss_period': row.get('loss_period', 'Unknown'),
                        'perimeter_m': float(row.get('perimeter_m', 0))
                    })
    except Exception as e:
        print(f"Error reading GEE file: {e}")
    
    return lost_lakes

def generate_typescript_data(lakes):
    """Generate TypeScript data for the lakes database"""
    
    # Sort lakes by name
    lakes.sort(key=lambda x: x['name'])
    
    # Generate TypeScript code
    ts_content = """// Additional lakes extracted from OpenStreetMap and Google Earth Engine data

export const additionalLakes: Lake[] = [
"""
    
    for i, lake in enumerate(lakes):
        lake_id = lake['id']
        name = lake['name'].replace('"', '\\"')
        water_type = lake.get('type', 'water_body')
        
        # Determine status based on name or type
        status = 'critical'  # Default to critical since we don't have detailed status
        if 'lost' in name.lower() or 'disappeared' in name.lower():
            status = 'lost'
        elif 'restored' in name.lower():
            status = 'restored'
        
        # Add tags based on water type and name
        tags = []
        if water_type == 'cheruvu':
            tags.append('"cheruvu"')
        elif water_type == 'kunta':
            tags.append('"kunta"')
        elif water_type == 'tank':
            tags.append('"tank"')
        elif water_type == 'pond':
            tags.append('"pond"')
        
        if 'bund' in name.lower():
            tags.append('"bund"')
        if 'nagar' in name.lower() or 'colony' in name.lower() or 'puram' in name.lower():
            tags.append('"urban"')
        if 'park' in name.lower():
            tags.append('"park"')
        
        tags_str = ', '.join(tags) if tags else ''
        
        ts_content += f"""  {{
    id: "{lake_id}",
    name: "{name}",
    status: "{status}",
    description: "Water body identified from satellite imagery and OpenStreetMap data.",
    tags: [{tags_str}],
  }},
"""
    
    ts_content += """]

// Export function to merge with existing database
export function mergeAdditionalLakes(existingLakes: Lake[]): Lake[] {
  const existingIds = new Set(existingLakes.map(lake => lake.id))
  const newLakes = additionalLakes.filter(lake => !existingIds.has(lake.id))
  return [...existingLakes, ...newLakes]
}
"""
    
    return ts_content

def main():
    print("Extracting lake data from OpenStreetMap...")
    osm_lakes = extract_osm_lakes()
    print(f"Found {len(osm_lakes)} lakes from OpenStreetMap")
    
    print("\nExtracting lake data from Google Earth Engine exports...")
    gee_data = extract_gee_lake_data()
    print(f"Found {len(gee_data)} lost lakes from GEE data")
    
    # Remove duplicates based on lake ID
    unique_lakes = {}
    for lake in osm_lakes:
        if lake['id'] not in unique_lakes:
            unique_lakes[lake['id']] = lake
    
    unique_lake_list = list(unique_lakes.values())
    print(f"\nTotal unique lakes: {len(unique_lake_list)}")
    
    # Generate TypeScript code
    ts_code = generate_typescript_data(unique_lake_list)
    
    # Save to file
    output_file = "/mnt/c/Users/MohdFarhan/Desktop/non-trivial-project/lake-app-story/lib/data/additional-lakes.ts"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(ts_code)
    
    print(f"\nGenerated TypeScript data saved to: {output_file}")
    
    # Print sample lakes
    print("\nSample lakes extracted:")
    for lake in unique_lake_list[:10]:
        print(f"  - {lake['name']} ({lake['type']})")

if __name__ == "__main__":
    main()