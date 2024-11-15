import cv2
import numpy as np
from env import Env

envVariables = Env();

# Paths to the YOLO configuration and weights files
config_file = "yolov3/yolov3.cfg"  # Path to the YOLO config file (download it)
weights_file = "yolov3/yolov3.weights"  # Path to the YOLO weights file (download it)
names_file = "yolov3/coco.names"  # Path to the file with class names (download it)
confidence_filter = 0.9 # only get the persons whom's close to the camera -> the players in the main court.

# Load YOLO
net = cv2.dnn.readNetFromDarknet(config_file, weights_file)
layer_names = net.getLayerNames()
output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]

# Load the class labels from the coco.names file
with open(names_file, 'r') as f:
    classes = [line.strip() for line in f.readlines()]

# Initialize the video capture
video_path = envVariables.VIDEO_ASSETS_DIR + 'part_00.mp4'  # Replace with your video file path
cap = cv2.VideoCapture(video_path)

# Check if video opened successfully
if not cap.isOpened():
    print("Error: Could not open video.")
    exit()

def detect(frame, net, output_layers):
    # Convert the frame to a blob for YOLO
    blob = cv2.dnn.blobFromImage(frame, 0.00392, (416, 416), (0, 0, 0), True, crop=False)

    # Pass the blob through the network
    net.setInput(blob)
    return net.forward(output_layers)

def drawBoxes(frame, detections):
    # Get frame dimensions
    height, width, channels = frame.shape

    # Initialize lists for detected objects
    class_ids = []
    confidences = []
    boxes = []

    # Process each of the detections
    for out in detections:
        for detection in out:
            scores = detection[5:]
            class_id = np.argmax(scores)
            confidence = scores[class_id]
            if confidence > confidence_filter:  # Only consider detections with confidence > confidence_filter
                # Get the bounding box coordinates
                center_x = int(detection[0] * width)
                center_y = int(detection[1] * height)
                w = int(detection[2] * width)
                h = int(detection[3] * height)

                # Get the top-left corner of the box
                x = int(center_x - w / 2)
                y = int(center_y - h / 2)

                # Store the results
                boxes.append([x, y, w, h])
                confidences.append(float(confidence))
                class_ids.append(class_id)

    # Apply Non-Maximum Suppression to eliminate redundant boxes
    indices = cv2.dnn.NMSBoxes(boxes, confidences, score_threshold=0.5, nms_threshold=0.4)

    # Loop through all the boxes and draw the bounding boxes
    if len(indices) > 0:
        for i in indices.flatten():
            if classes[class_ids[i]] == 'person':  # Only detect "person" class
                x, y, w, h = boxes[i]
                label = f"{classes[class_ids[i]]}: {confidences[i]:.2f}"
                color = (0, 255, 0)  # Green for person
                cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                cv2.putText(frame, label, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

while True:
    # Read a frame from the video
    ret, frame = cap.read()
    if not ret:
        break  # End of video
    detections = detect(frame, net, output_layers)

    drawBoxes(frame, detections);

    # Display the frame with bounding boxes
    cv2.imshow("Person Detection", frame)

    # Exit the loop if 'q' is pressed
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the video capture and close all OpenCV windows
cap.release()
cv2.destroyAllWindows()
