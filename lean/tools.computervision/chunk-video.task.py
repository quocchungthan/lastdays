from moviepy.editor import VideoFileClip
import os

from env import Env

envVariables = Env();

def split_video_into_parts(input_video_path, output_dir, part_duration=10*60):
    # Load the video
    video = VideoFileClip(input_video_path)
    
    # Get the total duration of the video (in seconds)
    video_duration = video.duration

    # Calculate the number of parts needed
    num_parts = int(video_duration // part_duration) + 1
    
    # Create the output directory if it doesn't exist
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    # Split the video into parts and save each one
    for i in range(num_parts):
        start_time = i * part_duration
        end_time = min((i + 1) * part_duration, video_duration)
        
        # Create a subclip for the current part
        part_clip = video.subclip(start_time, end_time)
        
        # Define output filename with the appropriate postfix (_00, _01, etc.)
        output_filename = os.path.join(output_dir, f"part_{i:02d}.mp4")
        
        # Write the video part to the output file
        part_clip.write_videofile(output_filename, codec="libx264", audio_codec="aac")
    
    # Close the video file
    video.close()
    print(f"Video split into {num_parts} parts successfully!")

# Example usage
input_video_path = envVariables.VIDEO_ASSETS_DIR + 'videoplayback.mp4'  # Path to the input video
output_dir = envVariables.VIDEO_ASSETS_DIR          # Directory to save the output video parts

split_video_into_parts(input_video_path, output_dir)
