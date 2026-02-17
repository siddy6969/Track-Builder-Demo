# Simulation & Physics Update

## Key Improvements

### 1. Optimal Racing Line
- Implemented a new **Racing Line Generator** that creates a realistic path.
- The line shifts to the **inside (apex)** of turns and approaches/exits wide.
- It stays strictly within track limits (calculated with safety margin).
- Visualized as an **orange dotted line** in the simulation.

### 2. Realistic Physics & AI
- **Automated Simulation**: The "Simulate" mode now features an **AI Driver** traversing the track autonomously.
- **Smart Braking**: The AI analyzes upcoming corners and brakes appropriately to safe cornering speeds.
- **Grip Limits**: Implemented lateral friction limits. If the kart turns too sharp for its speed, it will lose traction and slide (drift), scrubbing speed.
- **Removed Game Controls**: As requested, manual "game" controls are removed in favor of pure simulation. But you can still select different kart presets (Racing, Drift, etc.) to see how they handle the track.

### 3. Track Rendering
- Fixed the rendering of the racing line to follow the new generated path instead of just the centerline.
- Simulation view provides a HUD showing AI Speed, Lap Time, and Grip Status.

Enjoy watching your karts race on the optimal line!
