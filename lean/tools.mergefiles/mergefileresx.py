import xml.etree.ElementTree as ET
import os
from xml.dom import minidom

# Define the base path as a constant
BASE_PATH = 'C:/Users/Chuck/'

# Function to merge resx files and keep the xsd prefix, fixing the schema issues
def merge_resx_files(old_file_path, new_file_path, output_file_path):
    # Parse the old and new .resx files
    old_tree = ET.parse(old_file_path)
    old_root = old_tree.getroot()

    new_tree = ET.parse(new_file_path)
    new_root = new_tree.getroot()

    # Create a dictionary to store merged data, including comments
    merged_data = {}

    # Extract old data into dictionary (key -> value)
    for data in old_root.findall('data'):
        name = data.get('name')
        value = data.find('value').text if data.find('value') is not None else None
        comment = data.find('comment').text if data.find('comment') is not None else None
        merged_data[name] = {"value": value, "comment": comment}

    # Extract new data and update the merged_data dictionary
    for data in new_root.findall('data'):
        name = data.get('name')
        value = data.find('value').text if data.find('value') is not None else None
        comment = data.find('comment').text if data.find('comment') is not None else None
        merged_data[name] = {"value": value, "comment": comment}

    # Create a new root for the merged .resx with the correct namespace
    merged_root = ET.Element('root', xmlns='http://www.w3.org/2001/XMLSchema')

    # Add metadata and schema (copy from the old root), including namespaces
    for elem in old_root:
        if elem.tag != 'data':
            merged_root.append(elem)

    # Add the merged data elements, including comments
    for name, data in merged_data.items():
        data_elem = ET.SubElement(merged_root, 'data', name=name, **{'xml:space': 'preserve'})
        value_elem = ET.SubElement(data_elem, 'value')
        value_elem.text = data["value"]
        
        # Only add comment if it exists
        if data["comment"]:
            comment_elem = ET.SubElement(data_elem, 'comment')
            comment_elem.text = data["comment"]

    # Create a new tree and write it to the output file
    merged_tree = ET.ElementTree(merged_root)

    # Convert the merged XML tree to a string
    xml_str = minidom.parseString(ET.tostring(merged_root, encoding='utf-8')).toprettyxml(indent="  ")

    # Remove the XML declaration and extra blank lines
    xml_str = "\n".join([line for line in xml_str.splitlines() if line.strip() and not line.startswith("<?xml")])

    # Fix the 'xs' prefix issue manually by replacing it with 'xsd'
    xml_str = xml_str.replace('xs:', 'xsd:')

    # Write the cleaned-up, pretty-printed XML to the output file
    with open(output_file_path, 'w', encoding='utf-8') as output_file:
        output_file.write(xml_str)

# Define file paths relative to the base path
old_file = os.path.join(BASE_PATH, 'Documents/resetthings6/RBCC/source/Resources/Strings.zh.resx')
new_file = os.path.join(BASE_PATH, 'Downloads/Translated_IQ4-CirrusPro_strings/Strings.zh.resx')
output_file = os.path.join(BASE_PATH, 'Documents/resetthings6/RBCC/source/Resources/Strings.zh.merged.resx')

# Call the function to merge the .resx files
merge_resx_files(old_file, new_file, output_file)
