import os

# Common function to generate the JSON filename based on the video filename
def generate_json_filename(video_filename):
    """
    Generate the JSON filename based on the video filename.

    Args:
        video_filename (str): The name of the video file (e.g., part_00.mp4).
        
    Returns:
        str: The generated JSON filename (e.g., part_00_detections.json).
    """
    name_without_ext = os.path.splitext(video_filename)[0]
    json_filename = f"{name_without_ext}_detections.json"
    return json_filename