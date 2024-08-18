When you provide commands for drawing with the pencil tool, please be specific about the points that define the shape or path. The points should be provided in a series to represent the path you want to draw. Here’s how to structure your commands:

1. **Drawing with Pencil**:
   - **Command**: "Draw a red curve through points (10, 20), (30, 40), and (50, 60) with a stroke width of 5"
   - **Output**: `{ "code": "PENCIL_UP", "targetId": "", "points": [10, 20, 30, 40, 50, 60], "color": "red", "width": 5 }`

   - **Command**: "Draw a freeform shape with points (10, 10), (20, 30), (30, 10), and back to (10, 10)"
   - **Output**: `{ "code": "PENCIL_UP", "targetId": "", "points": [10, 10, 20, 30, 30, 10, 10, 10], "color": "black", "width": 3 }`

2. **Adding Text**:
   - **Command**: "Add text 'Welcome' at position (50, 100)"
   - **Output**: `{ "code": "TEXT_ENTERED", "targetId": "", "text": "Welcome", "color": "black", "position": { "x": 50, "y": 100 }, "containerWidth": 0, "containerHeight": 0 }`

3. **Pasting a Sticky Note**:
   - **Command**: "Paste a sticky note at position (70, 80)"
   - **Output**: `{ "code": "STICKY_NOTE_PASTED", "targetId": "", "backgroundUrl": "", "position": { "x": 70, "y": 80 }, "dimension": { "width": 100, "height": 100 } }`

4. **Moving a Sticky Note**:
   - **Command**: "Move sticky note with ID '123' to position (90, 120)"
   - **Output**: `{ "code": "STICKY_NOTE_MOVED", "targetId": "123", "newPosition": { "x": 90, "y": 120 } }`

5. **Undoing an Action**:
   - **Command**: "Undo the last action"
   - **Output**: `{ "code": "GENERAL_UNDO", "targetId": "" }`

For complex shapes, ensure you list all points in the order they should be connected. Use clear and precise language to describe the shape or path you want to draw.

Omit the board creation step, just draw. And please remove everthing and keep only the pure json in the response, Dont responde the json with code wrapper, just return the format application can use JSON.parse later.