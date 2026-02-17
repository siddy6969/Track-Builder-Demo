# Racing Corner Design Principles

Based on professional racing theory and the video "EVERY type of racing corner explained", here's how corners should be designed in the track builder.

## Corner Fundamentals

Every corner has three phases:
1. **Entry (Turn-in)** - Where the driver begins to turn and often brakes
2. **Apex** - The point closest to the inside of the corner
3. **Exit** - Where the driver unwinds steering and applies throttle

## Corner Types by Strategic Priority

### Type A Corners (Exit Priority)
**Purpose:** Lead onto long straights - maximize exit speed
**Strategy:** "Slow in, fast out" with late apex
**Implementation:** Use Increasing Radius or standard corners with emphasis on exit speed

### Type B Corners (Entry Priority)
**Purpose:** At the end of straights - maximize entry speed
**Strategy:** Brake as late as possible, early apex
**Implementation:** Use Decreasing Radius or tight corners

### Type C Corners (Intermediate)
**Purpose:** Between Type A and B corners
**Strategy:** Balanced approach, maintain momentum
**Implementation:** Constant Radius or flowing corners

---

## Detailed Corner Type Implementations

### 1. Hairpin (180°)
**Characteristics:**
- Extremely tight, 180-degree turn
- Requires heavy braking
- Low-speed corner where downforce is least important
- Late apex preferred for earlier acceleration

**Current Parameters:**
- Tension: 0.05 (tightest)
- Asymmetry: [0.4, 0.4] (short handles)

**Design Notes:**
- Critical for lap time - significant time can be gained/lost
- Often placed at end of long straights
- Creates overtaking opportunities

---

### 2. Chicane
**Characteristics:**
- Sequence of 2-3 alternating direction corners (left-right or right-left)
- Characterized by kerbs
- Racing lines through individual corners must be linked

**Current Parameters:**
- Tension: 0.08 (very tight)
- Asymmetry: [0.6, 0.6] (short handles for quick transitions)

**Design Notes:**
- Primary purpose: slow cars before sharp turns
- Challenges driver's ability to navigate quick direction changes
- Requires rhythm and precision

---

### 3. Esses (S-Bends)
**Characteristics:**
- High-speed sequences of alternating left-right changes
- Resembles the letter "S"
- Iconic corners (Suzuka, Austin, Silverstone)

**Current Parameters:**
- Tension: 0.3 (moderate-smooth)
- Asymmetry: [1.2, 1.2] (slightly extended handles)

**Design Notes:**
- Messing up one part compromises entire sequence
- Requires smooth weight transfer
- High-speed flow is critical

---

### 4. Double Apex
**Characteristics:**
- Long, winding corner requiring two apexes
- Treated as one continuous turn, not two separate corners
- Sustained load on the car

**Current Parameters:**
- Tension: 0.5 (smoothest)
- Asymmetry: [1.8, 1.8] (long handles)

**Design Notes:**
- Carrying speed is critical
- Aerodynamics play significant role
- Demands on front tires throughout

---

### 5. Constant Radius
**Characteristics:**
- Maintains same arc throughout turn
- Geometric uniformity
- Demanding on front tires

**Current Parameters:**
- Tension: 0.35 (moderate)
- Asymmetry: [1, 1] (equal entry/exit)

**Design Notes:**
- Found at Hungary, Silverstone
- Consistent steering input required
- Tests car balance and tire management

---

### 6. Decreasing Radius (Tightener)
**Characteristics:**
- Tightens as car progresses through corner
- Radius gets smaller toward exit
- Deceptive and challenging

**Current Parameters:**
- Tension: 0.25
- Asymmetry: [3.0, 0.25] (wide entry, tight exit)

**Design Notes:**
- Requires careful speed management
- Driver must brake while turning
- Examples: Bahrain, Miami, Paul Ricard
- Catches out aggressive drivers

---

### 7. Increasing Radius (Opener)
**Characteristics:**
- Opens up on exit
- Allows more speed as turn progresses
- Radius gets larger toward exit

**Current Parameters:**
- Tension: 0.25
- Asymmetry: [0.25, 3.0] (tight entry, wide exit)

**Design Notes:**
- Common on motorbike/shared tracks
- Examples: Portimão, Qatar
- Rewards brave early throttle application
- Ideal before long straights

---

### 8. 90-Degree Corner
**Characteristics:**
- Standard right-angle turn
- Moderate radius
- Classic corner type

**Current Parameters:**
- Tension: 0.15 (fairly tight)
- Asymmetry: [0.7, 0.7] (moderate handles)

**Design Notes:**
- Approximately 90-degree angle
- Balanced braking and acceleration
- Common on street circuits

---

### 9. Sweeper
**Characteristics:**
- Long, gradual, fast corner
- Consistent sweeping motion
- Can be heavily banked
- Often offers passing opportunities

**Current Parameters:**
- Tension: 0.45 (very smooth)
- Asymmetry: [1, 1] (equal, long handles)

**Design Notes:**
- High-speed corner
- Tests commitment and car stability
- Aerodynamics important
- Long, flowing arc

---

### 10. Banked Turn
**Characteristics:**
- Track surface tilted inward (positive camber)
- Allows higher cornering speeds
- Uses normal force to increase grip

**Current Parameters:**
- Tension: 0.35 (standard)
- Asymmetry: [1, 1]
- Banking: +15°

**Design Notes:**
- Enables higher speeds through corners
- Reduces tire wear
- Spectacular for spectators

---

### 11. Off-Camber Turn
**Characteristics:**
- Track slopes away from corner (negative camber)
- Reduces available grip
- Increases difficulty

**Current Parameters:**
- Tension: 0.28 (slightly tighter)
- Asymmetry: [1, 1]
- Banking: -5°

**Design Notes:**
- Car prone to sliding off
- Tests driver skill
- Adds challenge to track

---

## Additional Corner Types to Consider

### Snail Corner
**Description:** Corner shaped like snail shell, very slow in middle
**Suggested Implementation:**
- Tension: 0.1 (tight)
- Asymmetry: [2.0, 2.0] (gradual entry/exit, tight middle)
- Could be implemented as combination of decreasing then increasing radius

### Kink
**Description:** Shallow-angle corner on straight, minimal slowdown required
**Suggested Implementation:**
- Tension: 0.6 (very smooth)
- Asymmetry: [1, 1]
- Very subtle curve, almost straight

### Bend (High-Speed)
**Description:** Very large, very fast curve - full throttle throughout
**Suggested Implementation:**
- Tension: 0.55 (extremely smooth)
- Asymmetry: [1, 1]
- Acts more like straight than corner

---

## Design Best Practices

### Corner Sequencing
1. **Type A before straights** - Use Increasing Radius or Sweepers
2. **Type B after straights** - Use Hairpins or Decreasing Radius
3. **Chicanes on straights** - Break up long straights
4. **Esses for flow** - Create rhythm sections

### Apex Strategy
- **Late Apex:** For corners leading to straights (Type A)
- **Early Apex:** For corners at end of straights (Type B)
- **Geometric Apex:** For constant radius corners

### Track Flow
- Alternate fast and slow corners
- Create rhythm with Esses
- Use Chicanes to control speed
- Place Hairpins for overtaking zones

### Challenge Balance
- Mix corner types for variety
- Use Decreasing Radius to catch drivers
- Add Off-Camber for difficulty
- Include Sweepers for spectacle

---

## Visual Indicators in Track Builder

### In Editor View
- Cyan dots: Unassigned nodes
- Orange dots: Selected/editing node
- White track: Main racing surface
- Labels: Angle and distance information

### In Preview
- Gray surface: Track asphalt
- Red/White kerbs: Corner markers
- Orange dashed line: Racing line
- Checkered pattern: Start/finish

---

## Technical Implementation Notes

### Tension Values
- **0.05-0.15:** Tight corners (Hairpin, Chicane, 90°)
- **0.25-0.35:** Medium corners (Radius variations, Constant)
- **0.45-0.60:** Fast corners (Sweeper, Kink, Bend)

### Asymmetry Impact
- **[< 1, < 1]:** Sharp entry and exit (Hairpin, Chicane)
- **[1, 1]:** Balanced (Constant Radius, Sweeper)
- **[> 1, < 1]:** Wide entry, tight exit (Decreasing Radius)
- **[< 1, > 1]:** Tight entry, wide exit (Increasing Radius)
- **[> 1, > 1]:** Gradual both ways (Double Apex)

### Banking Effects
- **Positive (+5° to +15°):** Increases grip, allows higher speed
- **Zero (0°):** Standard flat surface
- **Negative (-5° to -10°):** Reduces grip, increases difficulty
