# Track Builder - Turn Type Visual Reference

This document describes how each turn type is implemented in the kart track builder, matching the visual characteristics shown in the reference diagrams.

## Turn Type Implementations

### 1. Constant Radius Corner
**Visual Characteristics:**
- Smooth, uniform arc from entry to exit
- Consistent radius throughout the turn
- Most common corner type

**Implementation:**
- Tension: 0.35 (moderate smoothness)
- Handle Asymmetry: [1, 1] (equal entry/exit)
- Creates a simple geometric arc with equal control handles on both nodes

**Usage:** Standard corners where drivers maintain a consistent line through the turn.

---

### 2. Hairpin Turn
**Visual Characteristics:**
- Very tight 180-degree turn
- Sharp apex with minimal radius
- Forces maximum deceleration

**Implementation:**
- Tension: 0.05 (very tight curve)
- Handle Asymmetry: [0.4, 0.4] (short handles for sharp turn)
- Creates the tightest possible curve with minimal radius

**Usage:** End of long straights, creates overtaking opportunities. Drivers must slow to a crawl.

---

### 3. The Chicane
**Visual Characteristics:**
- Quick succession of opposite-direction turns (Z-shape)
- Short distances between direction changes
- Rapid weight transfer

**Implementation:**
- Tension: 0.08 (tight but not as extreme as hairpin)
- Handle Asymmetry: [0.6, 0.6] (short handles for quick transitions)
- Requires 3+ nodes in alternating pattern

**Usage:** Slows cars on straights without heavy braking zones. Creates rhythm sections.

---

### 4. Double Apex
**Visual Characteristics:**
- Long corner with two distinct clipping points
- Brief wider arc between the two apexes
- Compound curve shape

**Implementation:**
- Tension: 0.5 (smooth, flowing)
- Handle Asymmetry: [1.8, 1.8] (longer handles for gradual curves)
- Two control nodes on the inside of the curve create the dual-apex effect

**Usage:** Long, flowing corners where drivers hit two distinct apexes. Requires precision.

---

### 5. Decreasing Radius (Tightener)
**Visual Characteristics:**
- Starts wide and fast
- Gets progressively tighter toward exit
- Deceptive corner that catches drivers out

**Implementation:**
- Tension: 0.25 (moderate)
- Handle Asymmetry: [3.0, 0.25] (long entry, short exit)
- Entry node has long handle (gentle), exit node has short handle (sharp)

**Usage:** Very tricky - drivers must brake while turning. Tests car control and judgment.

---

### 6. Increasing Radius (Opener)
**Visual Characteristics:**
- Starts sharp and tight
- Opens up progressively toward exit
- Allows early acceleration

**Implementation:**
- Tension: 0.25 (moderate)
- Handle Asymmetry: [0.25, 3.0] (short entry, long exit)
- Entry node has short handle (sharp), exit node has long handle (gentle)

**Usage:** Great for leading onto long straights. Rewards brave early throttle application.

---

### 7. The Esses (S-Bend)
**Visual Characteristics:**
- Flowing series of alternating turns
- Sine wave pattern
- Smooth rhythm without heavy braking

**Implementation:**
- Tension: 0.3 (moderate-smooth)
- Handle Asymmetry: [1.2, 1.2] (slightly longer handles for flow)
- Requires smooth transitions between alternating curves

**Usage:** Tests car balance and driver rhythm. Weight transfers like a pendulum.

---

### 8. Banked Turn
**Visual Characteristics:**
- Track surface tilted inward (positive camber)
- Allows higher cornering speeds
- Visual indication of banking angle

**Implementation:**
- Tension: 0.35 (standard curve)
- Handle Asymmetry: [1, 1] (equal)
- **Special:** `bankAngle > 0` (e.g., 15°)
- In 2D preview: Shown with standard curve + banking indicator

**Usage:** High-speed corners where banking helps maintain grip through normal force.

---

### 9. Off-Camber Turn
**Visual Characteristics:**
- Track slopes away from the corner (negative camber)
- Reduces available grip
- Visually challenging corner

**Implementation:**
- Tension: 0.28 (slightly tighter than standard)
- Handle Asymmetry: [1, 1] (equal)
- **Special:** `bankAngle < 0` (e.g., -5°)
- In 2D preview: Shown with standard curve + off-camber indicator

**Usage:** Increases difficulty. Car prone to sliding off. Tests driver skill.

---

### 10. 90° Corner
**Visual Characteristics:**
- Standard right-angle turn
- Moderate radius
- Classic corner type

**Implementation:**
- Tension: 0.15 (fairly tight)
- Handle Asymmetry: [0.7, 0.7] (moderate handles)
- Creates approximately 90-degree angle

**Usage:** Standard corner found on most tracks. Good balance of speed and technical challenge.

---

### 11. Sweeper
**Visual Characteristics:**
- Fast, flowing corner
- Large radius
- Minimal braking required

**Implementation:**
- Tension: 0.45 (very smooth)
- Handle Asymmetry: [1, 1] (equal, long handles)
- Creates gentle, high-speed curve

**Usage:** High-speed corners taken flat-out or with minimal lift. Tests commitment.

---

## Visual Elements in 2D Preview

All turn types are rendered with:
- **Track Surface:** Gray (#3a3a3a) with smooth bezier curves
- **Boundaries:** Green (rgba(0, 255, 0, 0.4)) lines showing track edges
- **Kerbs:** Red and white striped patterns at corner entry/exit
- **Racing Line:** Blue (#0066ff) dashed line showing ideal path
- **Turn Markers:** Orange circles with turn numbers
- **Turn Labels:** Turn type name displayed above each corner

## Technical Notes

### Tension Values
- Lower tension (0.05-0.15) = Tighter, sharper curves
- Medium tension (0.25-0.35) = Balanced curves
- Higher tension (0.45-0.5) = Smoother, flowing curves

### Handle Asymmetry
- [entry, exit] multipliers affect curve shape
- Values < 1 = Shorter handles (sharper)
- Values > 1 = Longer handles (gentler)
- Asymmetric values create dynamic radius changes

### Banking
- Positive values (5°-15°) = Banked inward
- Negative values (-5° to -10°) = Off-camber
- Zero = Flat surface
