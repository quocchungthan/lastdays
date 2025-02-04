import xml.etree.ElementTree as ET
import os
from xml.dom import minidom

# Define the base path as a constant
BASE_PATH = 'C:/Users/Chuck/'

# Function to sort resx file by 'name' attribute of the <data> elements
def sort_resx_file(input_file_path, output_file_path):
    # Parse the .resx file
    tree = ET.parse(input_file_path)
    root = tree.getroot()

    # Find all the <data> elements and sort them by the 'name' attribute
    data_elements = root.findall('data')
    sorted_data_elements = sorted(data_elements, key=lambda x: x.get('name'))

    # Create a new root for the sorted .resx (preserve schema elements)
    sorted_root = ET.Element('root', xmlns='http://www.w3.org/2001/XMLSchema')

    # Add metadata and schema elements (from the original root) to the new root
    for elem in root:
        if elem.tag != 'data':  # Keep non-<data> elements (e.g., schema, metadata)
            sorted_root.append(elem)

    # Add the sorted <data> elements to the new root
    for data_elem in sorted_data_elements:
        sorted_root.append(data_elem)

    # Create a new tree with the sorted elements
    sorted_tree = ET.ElementTree(sorted_root)

    # Convert the sorted XML tree to a string with pretty formatting
    xml_str = minidom.parseString(ET.tostring(sorted_root, encoding='utf-8')).toprettyxml(indent="  ")

    # Remove the XML declaration and extra blank lines
    xml_str = "\n".join([line for line in xml_str.splitlines() if line.strip() and not line.startswith("<?xml")])

    # Fix the 'xs' prefix issue manually by replacing it with 'xsd'
    xml_str = xml_str.replace('xs:', 'xsd:')

    # Write the cleaned-up, pretty-printed XML to the output file
    with open(output_file_path, 'w', encoding='utf-8') as output_file:
        output_file.write(xml_str)

# Define file paths relative to the base path
input_file = os.path.join(BASE_PATH, 'Documents/resetthings6/RBCC/source/Resources/Strings.zh.resx')
output_file = os.path.join(BASE_PATH, 'Documents/resetthings6/RBCC/source/Resources/Strings.zh.sorted.resx')

# Call the function to sort the .resx file by the <data> 'name' attribute
sort_resx_file(input_file, output_file)
