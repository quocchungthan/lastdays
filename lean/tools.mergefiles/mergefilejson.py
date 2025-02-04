import json
import os

# Define the base path as a constant
BASE_PATH = 'C:/Users/Chuck/'

def merge_json_files(old_file_path, new_file_path, output_file_path):
    # Read the old and new JSON files
    with open(old_file_path, 'r', encoding='utf-8') as old_file:
        old_data = json.load(old_file)
    
    with open(new_file_path, 'r', encoding='utf-8') as new_file:
        new_data = json.load(new_file)
    
    # Merge old and new data, prioritizing the new data for matching keys
    merged_data = old_data.copy()  # Start with the old data
    merged_data.update(new_data)   # Update with the new data (overwrites old values)

    # Sort the merged data by keys (alphabetically)
    sorted_merged_data = {key: merged_data[key] for key in sorted(merged_data.keys())}
    
    # Write the merged data to the output file
    with open(output_file_path, 'w', encoding='utf-8') as output_file:
        json.dump(sorted_merged_data, output_file, ensure_ascii=False, indent=4)


# Define file paths relative to the base path
old_file = os.path.join(BASE_PATH, 'Documents/resetthings6/RBCC/UI/src/assets/i18n/zh.json')
new_file = os.path.join(BASE_PATH, 'Downloads/Translated_IQ4-CirrusPro_strings/zh.json')
output_file = os.path.join(BASE_PATH, 'Documents/resetthings6/RBCC/UI/src/assets/i18n/zh.merged.json')

# Call the function to merge the files
merge_json_files(old_file, new_file, output_file)
