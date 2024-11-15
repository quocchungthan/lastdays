import cv2
import json
import os
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
def draw_boxes(frame, detections, timestamp, scale_x, scale_y):
    for detection in detections:
        # Match the timestamp to the detection
        detection_timestamp = milliseconds_to_timestamp(detection['timestamp'])
        if detection_timestamp == timestamp:  # Match the timestamp from the detection file
            for obj in detection['detections']:
                if obj['class'] == 'person':
                    x, y, w, h = obj['bbox']
                    # Scale the bounding box coordinates
                    x = int(x * scale_x)
                    y = int(y * scale_y)
                    w = int(w * scale_x)
                    h = int(h * scale_y)

                    confidence = obj['confidence']
                    label = f"{obj['class']}: {confidence:.2f}"
                    color = (0, 255, 0)  # Green for person
                    cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
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

while True:
    ret, frame = cap.read()
    if not ret:
        break  # End of video

    # Resize the frame
    frame, scale_factor = resize_frame(frame, max_width=920)

    # Get the current timestamp of the frame in milliseconds
    current_timestamp_ms = cap.get(cv2.CAP_PROP_POS_MSEC)
    
    # Convert milliseconds to a readable timestamp format
    timestamp = milliseconds_to_timestamp(current_timestamp_ms)

    # Draw bounding boxes for detections at the current timestamp
    # Apply scaling factor for bounding boxes
    scale_x = scale_y = scale_factor
    draw_boxes(frame, detections, timestamp, scale_x, scale_y)

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
