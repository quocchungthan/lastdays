import cv2
import json
import os
import random
from datetime import datetime
from env import Env
from utils.filename_helper import generate_json_filename

envVariables = Env()

# Load YOLO
config_file = "yolov3/yolov3.cfg"
weights_file = "yolov3/yolov3.weights"
names_file = "yolov3/coco.names"
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

# Load detection results from file
def load_detections_from_file(video_filename):
    json_filename = envVariables.VIDEO_ASSETS_DIR + generate_json_filename(video_filename)
    detections = []
    try:
        with open(json_filename, 'r') as f:
            for line in f:
                detections.append(json.loads(line))
    except Exception as e:
        print(f"Error loading detections: {e}")
    return detections

# Convert milliseconds to timestamp format (YYYY-MM-DD HH:MM:SS)
def milliseconds_to_timestamp(ms):
    # Convert milliseconds to seconds
    seconds = ms / 1000
    # Create datetime object
    timestamp = datetime.utcfromtimestamp(seconds).strftime('%Y-%m-%d %H:%M:%S')
    return timestamp

# Function to draw bounding boxes based on detections
def draw_boxes(frame, detections, timestamp_ms, scale_x, scale_y, time_window_ms=1000, object_tracker={}):
    # We will only track the most recent bounding boxes and avoid erasing old ones
    # Track new object detections
    for detection in detections:
        detection_timestamp_ms = detection['video_time']
        
        # Check if current timestamp is within the configurable time window
        if abs(timestamp_ms - detection_timestamp_ms) <= time_window_ms:
            for obj in detection['detections']:
                if obj['class'] == 'person':  # Only draw boxes for 'person' class
                    x, y, w, h = obj['bbox']
                    # Scale the bounding box coordinates based on the resized frame
                    x = int(x * scale_x)
                    y = int(y * scale_y)
                    w = int(w * scale_x)
                    h = int(h * scale_y)

                    confidence = obj['confidence']
                    label = f"{obj['class']}: {confidence:.2f}"

                    # Calculate the center of the bounding box
                    center_x = x + w // 2
                    center_y = y + h // 2

                    # Check if the object is already tracked, if not assign a new random color
                    if obj['class'] not in object_tracker:
                        object_tracker[obj['class']] = {}

                    # Check for previously detected object in the tracker list
                    matched = False
                    for obj_id, obj_info in object_tracker[obj['class']].items():
                        prev_center_x, prev_center_y, prev_color, prev_bbox = obj_info
                        # If the center of the new box is close to the previous one, we consider it the same object
                        if abs(center_x - prev_center_x) < 50 and abs(center_y - prev_center_y) < 50:
                            matched = True
                            # Reuse the color
                            color = prev_color
                            # Update the tracked bounding box
                            object_tracker[obj['class']][obj_id] = (center_x, center_y, color, (x, y, w, h))
                            break
                    
                    if not matched:
                        # Assign a random color for the new object
                        color = (random.randint(0, 255), random.randint(0, 255), random.randint(0, 255))
                        obj_id = len(object_tracker[obj['class']])  # Unique ID for the object
                        object_tracker[obj['class']][obj_id] = (center_x, center_y, color, (x, y, w, h))  # Add new object to tracker

                    # Draw the bounding box with the corresponding color
                    cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)  # Thinner line (change thickness to 1)
                    cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

# Function to resize frame while maintaining aspect ratio
def resize_frame(frame, max_width=920):
    # Get original dimensions
    height, width = frame.shape[:2]

    # Calculate scaling factor to fit the max_width
    if width > max_width:
        scaling_factor = max_width / width
        new_width = max_width
        new_height = int(height * scaling_factor)
        # Resize the frame
        resized_frame = cv2.resize(frame, (new_width, new_height))
        return resized_frame, scaling_factor
    else:
        # If the width is already smaller than max_width, return original frame and scale factor as 1
        return frame, 1

# Process video frames
video_filename = os.path.basename(video_path)  # Get video filename (e.g., part_00.mp4)
detections = load_detections_from_file(video_filename)

frame_counter = 0
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))  # Total number of frames in the video

# Set the configurable time window for bounding box visibility (in milliseconds)
time_window_ms = 50  # Change this value to adjust the duration (e.g., 1500 for 1.5 seconds)

# Initialize an empty object tracker
object_tracker = {}

while True:
    ret, frame = cap.read()
    if not ret:
        break  # End of video

    # Resize the frame
    frame, scale_factor = resize_frame(frame, max_width=920)

    # Get the current timestamp of the frame in milliseconds
    current_timestamp_ms = cap.get(cv2.CAP_PROP_POS_MSEC)

    # Draw bounding boxes for detections at the current timestamp
    # Apply scaling factor for bounding boxes
    scale_x = scale_y = scale_factor
    draw_boxes(frame, detections, current_timestamp_ms, scale_x, scale_y, time_window_ms, object_tracker)

    # Display the frame with bounding boxes
    cv2.imshow("Person Detection", frame)

    # Update the progress in the console
    frame_counter += 1
    progress = (frame_counter / total_frames) * 100
    print(f"Processing frame {frame_counter}/{total_frames} - {progress:.2f}% completed", end="\r")

    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release video capture and close OpenCV windows
cap.release()
cv2.destroyAllWindows()
