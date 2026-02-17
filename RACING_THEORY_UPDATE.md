# Track Builder Updates - Racing Corner Theory Implementation

## Summary of Changes

Based on the YouTube video "EVERY type of racing corner explained" and professional racing theory, I've enhanced the track builder with proper racing corner classifications and three new corner types.

---

## New Corner Types Added

### 1. **Kink** (150-170° angles)
- **Description:** Shallow-angle corner on a straight where minimal slowdown is required
- **Tension:** 0.6 (very smooth, almost straight)
- **Asymmetry:** [1, 1] (balanced)
- **Use Case:** High-speed sections where drivers barely need to turn
- **Available for:** Very gentle turns (150-170°) and almost straight sections (170-180°)

### 2. **Bend** (170-180° angles)
- **Description:** Very large, very fast curve taken at full throttle throughout
- **Tension:** 0.55 (extremely smooth)
- **Asymmetry:** [1, 1] (balanced)
- **Use Case:** Acts more like a straight than a corner, full-throttle sections
- **Available for:** Very gentle turns (150-170°) and almost straight sections (170-180°)

### 3. **Snail Corner** (1-30° angles)
- **Description:** Corner shaped like a snail shell, very slow in the middle
- **Tension:** 0.1 (tight)
- **Asymmetry:** [2.0, 2.0] (gradual entry/exit, tight middle)
- **Use Case:** Technical slow-speed corners with unique shape
- **Available for:** Hairpin angles (1-30°)

---

## Racing Theory Integration

### Corner Classification by Strategic Priority

The implementation now reflects professional racing corner strategy:

#### **Type A Corners** (Exit Priority)
- **Purpose:** Lead onto long straights
- **Strategy:** "Slow in, fast out" with late apex
- **Corner Types:** Increasing Radius, Sweeper
- **Goal:** Maximize exit speed for straight-line acceleration

#### **Type B Corners** (Entry Priority)
- **Purpose:** At the end of straights
- **Strategy:** Brake as late as possible, early apex
- **Corner Types:** Decreasing Radius, Hairpin
- **Goal:** Maximize entry speed, less emphasis on exit

#### **Type C Corners** (Intermediate)
- **Purpose:** Between Type A and B corners
- **Strategy:** Balanced approach, maintain momentum
- **Corner Types:** Constant Radius, flowing corners
- **Goal:** Smooth transitions, preserve speed

---

## Complete Corner Type List (14 Types)

| Corner Type | Tension | Asymmetry | Angle Range | Speed | Purpose |
|-------------|---------|-----------|-------------|-------|---------|
| **Hairpin** | 0.05 | [0.4, 0.4] | 1-60° | Slow | Tight 180° turns, overtaking zones |
| **Snail Corner** | 0.1 | [2.0, 2.0] | 1-30° | Slow | Technical slow corners |
| **Chicane** | 0.08 | [0.6, 0.6] | 30-90° | Slow-Med | Quick direction changes |
| **90°** | 0.15 | [0.7, 0.7] | 30-90° | Slow-Med | Standard right-angle corners |
| **Decreasing Radius** | 0.25 | [3.0, 0.25] | 1-120° | Varies | Type B - Entry priority |
| **Increasing Radius** | 0.25 | [0.25, 3.0] | 1-150° | Varies | Type A - Exit priority |
| **Off-Camber Turn** | 0.28 | [1, 1] | 1-90° | Slow-Med | Reduced grip, challenging |
| **Esses** | 0.3 | [1.2, 1.2] | 120-180° | Fast | High-speed S-curves |
| **Constant Radius** | 0.35 | [1, 1] | All | Varies | Uniform arc throughout |
| **Banked Turn** | 0.35 | [1, 1] | 90-150° | Med-Fast | Positive camber, higher speeds |
| **Sweeper** | 0.45 | [1, 1] | 90-170° | Fast | Long, flowing corners |
| **Double Apex** | 0.5 | [1.8, 1.8] | 60-150° | Med-Fast | Two clipping points |
| **Bend** | 0.55 | [1, 1] | 150-180° | Very Fast | Full-throttle curve |
| **Kink** | 0.6 | [1, 1] | 150-180° | Very Fast | Minimal slowdown |

---

## Corner Fundamentals (3 Phases)

Every corner in racing has three fundamental phases:

1. **Entry (Turn-in)**
   - Driver begins to turn the wheel
   - Often involves braking
   - Weight shifts to front for better grip

2. **Apex**
   - Point closest to inside of corner
   - Can be geometric apex (innermost point)
   - Or racing apex (strategically chosen for speed)

3. **Exit**
   - Driver unwinds steering
   - Applies throttle
   - Accelerates out of turn

---

## Track Design Best Practices

### Corner Sequencing
1. **Type A before straights** → Use Increasing Radius or Sweepers
2. **Type B after straights** → Use Hairpins or Decreasing Radius  
3. **Chicanes on straights** → Break up long straights
4. **Esses for flow** → Create rhythm sections

### Apex Strategy
- **Late Apex:** For corners leading to straights (Type A)
- **Early Apex:** For corners at end of straights (Type B)
- **Geometric Apex:** For constant radius corners

### Challenge Balance
- Mix corner types for variety
- Use Decreasing Radius to catch drivers
- Add Off-Camber for difficulty
- Include Sweepers for spectacle
- Place Hairpins for overtaking zones

---

## Implementation Details

### Files Modified

1. **`src/canvas/SegmentRenderer.js`**
   - Added Kink, Bend, Snail Corner to TENSION map
   - Added Snail Corner to HANDLE_ASYMMETRY map
   - Updated comments with racing theory explanations
   - Organized tension values by speed category

2. **`src/utils/turnClassification.js`**
   - Added new corner types to appropriate angle ranges
   - Kink and Bend for 150-180° angles
   - Snail Corner for 1-30° angles
   - Esses now available for sweeper angles too

3. **`CORNER_DESIGN.md`** (New)
   - Comprehensive racing corner design guide
   - Strategic priority system (Type A, B, C)
   - Detailed corner type descriptions
   - Best practices for track design

---

## How to Use New Corner Types

### Kink
1. Create nodes with 150-170° angle
2. Select the node in Curve Editor
3. Choose "Kink" from available options
4. Creates shallow, high-speed curve

### Bend
1. Create nodes with 170-180° angle (almost straight)
2. Select the node in Curve Editor
3. Choose "Bend" from available options
4. Creates full-throttle flowing curve

### Snail Corner
1. Create nodes with 1-30° angle (very sharp)
2. Select the node in Curve Editor
3. Choose "Snail Corner" from available options
4. Creates gradual entry/exit with tight middle section

---

## Visual Changes

- **Racing line color:** Changed from blue to orange (#ff4d00) to match theme
- **Node selection:** Now selects the clicked node directly (not previous node)
- **Preview:** Clean track view without green boundaries or orange markers

---

## Racing Theory Resources

Based on:
- YouTube: "EVERY type of racing corner explained"
- Professional racing corner classification
- Type A/B/C strategic priority system
- Three-phase corner analysis (Entry, Apex, Exit)

The track builder now implements industry-standard racing corner theory, allowing users to create realistic and strategically designed race tracks! 🏁
