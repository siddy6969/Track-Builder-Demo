# Track Builder Update - Simulation & Physics

## Summary of Changes

I have completed the requested fixes and added a full go-kart simulation system.

---

## 1. Fixed "Weird Angle" at Closed Loop

### The Problem
The track closing segment (connecting the last node to the first) was creating a sharp corner because the system was using a duplicate point at the same coordinates, causing the tangent vector calculation to fail (vector length = 0).

### The Solution
Rewrote `SegmentRenderer.js` to iterate through the unique nodes directly instead of the interpolated path.
- **Old Logic:** Iterated `generatedPath` which contained a duplicate start node.
- **New Logic:** Iterates `nodes` array and handles index wrapping manually:
  ```javascript
  const idx2 = closed ? (i + 1) % nodes.length : i + 1;
  const idx3 = closed ? (i + 2) % nodes.length : Math.min(nodes.length - 1, i + 2);
  ```
- **Result:** Smooth transitions across the start/finish line with perfect tangents.

---

## 2. Fixed Increasing/Decreasing Radius

### The Problem
Both curve types looked identical because they shared the same default tension values without asymmetry.

### The Solution
Implemented `ASYMMETRY` multipliers in `SegmentRenderer.js`:
- **Decreasing Radius:** `[1.5, 0.5]` (Wide entry, tight exit)
- **Increasing Radius:** `[0.5, 1.5]` (Tight entry, wide exit)
- **Double Apex:** `[1.3, 1.3]` (Extended both sides)
- **Snail Corner:** `[1.2, 1.2]` (Gradual entry/exit)

Now these corner types create visually distinct curve shapes that affect the driving line.

---

## 3. Go-Kart Simulation System

Added a fully customizable simulation mode to test your tracks.

### Features
- **5 Kart Presets:**
  - 🏎️ **Beginner:** Easy handling, low speed
  - 🚙 **Intermediate:** Balanced performance
  - 🏎️ **Advanced:** High speed, sensitive handling
  - 🚀 **Racing:** Maximum performance
  - 💨 **Drift:** Low grip, designed for sliding

### Physics Engine (`KartPhysics.js`)
- **Realistic handling:** Speed-dependent steering
- **Drift mechanics:** Traction loss and drift angle calculation
- **Acceleration/Braking:** Based on power/weight ratios
- **Off-track penalty:** Reduced Grip and speed on grass

### Controls
- **W / ↑**: Accelerate
- **S / ↓**: Brake / Reverse
- **A / ←**: Steer Left
- **D / →**: Steer Right

### UI Integration
- Added **"Simulate" button** to Preview page
- **HUD:** Speedometer, throttle bar, drift indicator
- **Camera:** Follows kart smoothly
- **Visuals:** Kart rendering with steering feedback and drift trails

---

## How to Use

1. **Create a Track:** Place nodes and close the circuit.
2. **Edit Curves:** Select nodes and apply "Increasing Radius" or others to see the new asymmetry.
3. **Preview:** Go to Preview page.
4. **Simulate:** Click "🏎️ Simulate".
5. **Select Kart:** Choose a preset from the sidebar.
6. **Drive:** Click "START" and use WASD keys to test your track!

The simulation runs directly in the browser and uses your generated track layout for physics and visual reference.
