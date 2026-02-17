# Turn Type Parameter Reference

This document shows the exact parameters used for each turn type in the kart track builder.

## Parameter Definitions

### Tension
Controls the overall smoothness/tightness of the curve:
- **Range:** 0.05 (tightest) to 0.5 (smoothest)
- **Effect:** Lower values create sharper, tighter curves; higher values create flowing, gentle curves

### Handle Asymmetry [entry, exit]
Controls the shape of the curve at entry and exit points:
- **Format:** [entry_multiplier, exit_multiplier]
- **Range:** 0.25 (very short) to 3.0 (very long)
- **Effect:** Asymmetric values create dynamic radius changes (decreasing/increasing radius)

---

## Turn Type Parameters

| Turn Type | Tension | Handle Asymmetry | Visual Result |
|-----------|---------|------------------|---------------|
| **Hairpin** | 0.05 | [0.4, 0.4] | Extremely tight 180° turn with minimal radius |
| **Chicane** | 0.08 | [0.6, 0.6] | Quick, sharp direction changes in Z-pattern |
| **90°** | 0.15 | [0.7, 0.7] | Standard right-angle corner with moderate radius |
| **Decreasing Radius** | 0.25 | [3.0, 0.25] | Starts wide (long entry), ends tight (short exit) |
| **Increasing Radius** | 0.25 | [0.25, 3.0] | Starts tight (short entry), ends wide (long exit) |
| **Off-Camber Turn** | 0.28 | [1, 1] | Standard curve with negative banking |
| **Esses** | 0.3 | [1.2, 1.2] | Flowing S-curves with slightly extended handles |
| **Constant Radius** | 0.35 | [1, 1] | Uniform arc with equal entry and exit |
| **Banked Turn** | 0.35 | [1, 1] | Standard curve with positive banking |
| **Sweeper** | 0.45 | [1, 1] | Very smooth, high-speed flowing corner |
| **Double Apex** | 0.5 | [1.8, 1.8] | Long, gentle curve with extended handles |

---

## Special Attributes

### Banking Angles
Some turn types include banking information:

| Turn Type | Bank Angle | Effect |
|-----------|------------|--------|
| **Banked Turn** | +15° | Track tilts inward, increases grip |
| **Off-Camber Turn** | -5° | Track tilts outward, reduces grip |
| All others | 0° | Flat surface |

---

## How Parameters Affect Curve Shape

### Tension Examples
```
Hairpin (0.05):     ╭─╮     Very tight, sharp curve
                    │ │
                    
90° (0.15):         ╭──╮    Moderate curve
                    │  │
                    
Sweeper (0.45):     ╭────╮  Very gentle, flowing curve
                    │    │
```

### Handle Asymmetry Examples
```
Decreasing Radius [3.0, 0.25]:
Entry ────────╮        Long entry handle (gentle)
              │
              ╰─ Exit  Short exit handle (sharp)

Increasing Radius [0.25, 3.0]:
Entry ─╮              Short entry handle (sharp)
       │
       ╰──────── Exit Long exit handle (gentle)

Constant Radius [1, 1]:
Entry ────╮            Equal handles
          │
          ╰──── Exit  (uniform arc)
```

---

## Visual Indicators in Preview

### Track Elements
- **Track Surface:** Gray (#3a3a3a) - The main racing surface
- **Boundaries:** Green (rgba(0, 255, 0, 0.4)) - Track edge limits
- **Kerbs:** Red/White stripes - Corner entry/exit markers
- **Racing Line:** Blue dashed (#0066ff) - Ideal driving line

### Turn Markers
- **Orange Circle:** Turn number indicator
- **Label:** Turn type name (e.g., "Hairpin", "Chicane")
- **Position:** Placed at each node with a turn assigned

---

## Usage Tips

### Creating Realistic Tracks

1. **Hairpins** - Use at the end of long straights for overtaking zones
2. **Chicanes** - Place on straights to slow cars down
3. **Sweepers** - Connect sections with high-speed flow
4. **Decreasing Radius** - Add challenge and catch drivers out
5. **Increasing Radius** - Lead into straights for acceleration zones
6. **Double Apex** - Create long, technical corners
7. **Esses** - Add rhythm sections that test car balance
8. **Banked Turns** - Allow higher speeds through corners
9. **Off-Camber** - Increase difficulty and reduce grip

### Combining Turn Types
- Follow a **Hairpin** with an **Increasing Radius** to create an acceleration zone
- Use **Chicanes** to break up long straights
- Connect **Esses** with **Sweepers** for flowing sections
- Place **Decreasing Radius** corners before tight sections to catch aggressive drivers

---

## Technical Implementation

The curve rendering uses Bézier curves with control points calculated based on:
1. Segment direction and length
2. Tension value (affects control point distance)
3. Handle asymmetry (affects entry vs exit shape)
4. Neighboring segments (for smooth transitions)

The formula for control point distance:
```javascript
controlPointDistance = segmentLength * tension * handleMultiplier
```

Where:
- `segmentLength` = Distance between nodes
- `tension` = Turn type tension value (0.05-0.5)
- `handleMultiplier` = Entry or exit multiplier from asymmetry array
