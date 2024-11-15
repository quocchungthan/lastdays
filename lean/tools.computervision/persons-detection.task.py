import cv2
import numpy as np
import json
import os
from env import Env
from utils.filename_helper import generate_json_filename

envVariables = Env()

# Paths to YOLO configuration and weights files
config_file = "yolov3/yolov3.cfg"  # Path to the YOLO config file (download it)
weights_file = "yolov3/yolov3.weights"  # Path to the YOLO weights file (download it)
names_file = "yolov3/coco.names"  # Path to the file with class names (download it)
confidence_filter = 0.9  # Confidence threshold

# Load YOLO
net = cv2.dnn.readNetFromDarknet(config_file, weights_file)
layer_names = net.getLayerNames()
output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]

# Load class labels
with open(names_file, 'r') as f:
    classes = [line.strip() for line in f.readlines()]

# Initialize video capture
video_path = envVariables.VIDEO_ASSETS_DIR + 'part_00.mp4'
cap = cv2.VideoCapture(video_path)

# Check if video opened successfully
if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

# Get total number of frames in the video
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

# Function to detect objects
def detect(frame, net, output_layers):
    blob = cv2.dnn.blobFromImage(frame, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
    net.setInput(blob)
    return net.forward(output_layers)

# Function to save detection results to a JSON file
def save_detections_to_file(detections, video_time, video_filename):
    json_filename = envVariables.VIDEO_ASSETS_DIR + generate_json_filename(video_filename)
    detection_data = {
        "video_time": video_time,  # Store the video time (in milliseconds)
        "detections": detections
    }
    try:
        with open(json_filename, 'a') as f:
            json.dump(detection_data, f)
            f.write("\n")  # Add newline to separate each entry
    except Exception as e:
        print(f"Error saving detections: {e}")

# Function to load the last processed record from the JSON file
def get_last_processed_time_from_file():
    json_filename = envVariables.VIDEO_ASSETS_DIR + generate_json_filename('part_00.mp4')
    if os.path.exists(json_filename):
        try:
            with open(json_filename, 'r') as f:
                lines = f.readlines()
                if lines:
                    last_entry = json.loads(lines[-1])  # Get the latest detection entry
                    return last_entry["video_time"]
        except Exception as e:
            print(f"Error reading detection file: {e}")
    return 0  # If no previous records, start from the beginning

# Get the last processed time (in milliseconds) from the JSON file
last_processed_time = get_last_processed_time_from_file()

# Set the video capture position to resume from the last processed time
cap.set(cv2.CAP_PROP_POS_MSEC, last_processed_time)

# Detection loop
frame_counter = 0
while True:
    ret, frame = cap.read()
    if not ret:
        break  # End of video

    detections = detect(frame, net, output_layers)
    detected_objects = []

    # Process detections and collect data
    for out in detections:
        for detection in out:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]

            if confidence > confidence_filter and classes[class_id] == 'person':
                # Get frame dimensions
                height, width, channels = frame.shape

                # Bounding box coordinates
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width)
                h = int(detection[3] * height)
                x = int(center_x - w / 2)
                y = int(center_y - h / 2)

                # Store detected object information
                detected_objects.append({
                    "class": classes[class_id],
                    "confidence": float(confidence),
                    "bbox": [x, y, w, h]
                })

    # Get the current video time in milliseconds
    video_time = cap.get(cv2.CAP_PROP_POS_MSEC)

    # Save the detections to file with video time
    video_filename = os.path.basename(video_path)  # Extract the video filename from the path
    save_detections_to_file(detected_objects, video_time, video_filename)

    # Update the progress in the console
    frame_counter += 1
    progress = (frame_counter / total_frames) * 100
    print(f"Processing frame {frame_counter}/{total_frames} - {progress:.2f}% completed", end="\r")

# Release video capture
cap.release()
print("\nDetection complete.")
