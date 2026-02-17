/**
 * Turn classification system based on angle and speed
 * 
 * IMPORTANT: The angle is the interior turn angle (between incoming and outgoing vectors)
 * - SMALL angle (1-30°) = SHARP turn = HAIRPIN = SLOW speed
 * - LARGE angle (150-180°) = GENTLE turn = SWEEPER/STRAIGHT = FAST speed
 */

/** Classify turn by angle into turn type categories */
export function classifyTurnType(angle) {
  if (angle >= 1 && angle < 30) return "hairpin";      // Very sharp U-turn
  if (angle >= 30 && angle < 60) return "very_tight"; // Sharp corner
  if (angle >= 60 && angle < 90) return "tight";      // Medium-sharp corner
  if (angle >= 90 && angle < 120) return "medium";    // Medium corner
  if (angle >= 120 && angle < 150) return "sweeper";  // Wide corner
  if (angle >= 150 && angle < 170) return "kink";      // Very gentle turn
  return "straight";                                    // Almost straight (170-180°)
}

/** Classify turn by speed category - SMALLER angle = SHARPER turn = SLOWER speed */
export function classifySpeed(angle) {
  if (angle < 60) return "slow";      // Hairpin, very tight - requires slow speed
  if (angle < 120) return "medium";   // Tight to medium - medium speed
  return "fast";                       // Sweeper, kink, straight - fast speed
}

/** Get valid curve types for a given angle */
export function getValidCurveTypes(angle) {
  const turnType = classifyTurnType(angle);
  const speed = classifySpeed(angle);

  const validTypes = [];

  // Hairpin (1-30°) - Very sharp U-turn, SLOW speed
  if (turnType === "hairpin") {
    validTypes.push("Hairpin");
    validTypes.push("Snail Corner");  // Slow in middle
    validTypes.push("Decreasing Radius", "Increasing Radius");
    validTypes.push("Off-Camber Turn");
    return validTypes;
  }

  // Very Tight (30-60°) - Sharp corner, SLOW speed
  if (turnType === "very_tight") {
    validTypes.push("Hairpin", "90°");
    validTypes.push("Decreasing Radius", "Increasing Radius", "Constant Radius");
    validTypes.push("Chicane", "Off-Camber Turn");
    return validTypes;
  }

  // Tight (60-90°) - Medium-sharp corner, SLOW-MEDIUM speed
  if (turnType === "tight") {
    validTypes.push("90°", "Constant Radius");
    validTypes.push("Decreasing Radius", "Increasing Radius");
    validTypes.push("Chicane", "Double Apex");
    validTypes.push("Off-Camber Turn");
    return validTypes;
  }

  // Medium (90-120°) - Medium corner, MEDIUM speed
  if (turnType === "medium") {
    validTypes.push("Constant Radius", "Double Apex");
    validTypes.push("Decreasing Radius", "Increasing Radius");
    validTypes.push("Sweeper", "Banked Turn");
    return validTypes;
  }

  // Sweeper (120-150°) - Wide corner, FAST speed
  if (turnType === "sweeper") {
    validTypes.push("Sweeper", "Constant Radius");
    validTypes.push("Increasing Radius", "Double Apex");
    validTypes.push("Banked Turn");
    validTypes.push("Esses");  // Can be part of S-curves
    return validTypes;
  }

  // Kink (150-170°) - Very gentle turn, FAST speed
  if (turnType === "kink") {
    validTypes.push("Kink");  // Shallow angle corner
    validTypes.push("Sweeper", "Constant Radius");
    validTypes.push("Esses");
    validTypes.push("Bend");  // Very fast curve
    return validTypes;
  }

  // Straight (170-180°) - Almost straight, FAST speed
  if (turnType === "straight") {
    validTypes.push("Bend");  // Full-throttle curve
    validTypes.push("Kink");  // Minimal slowdown
    validTypes.push("Esses", "Chicane");
    return validTypes;
  }

  return ["Constant Radius"];
}

/** Get speed label */
export function getSpeedLabel(angle) {
  const speed = classifySpeed(angle);
  return speed.charAt(0).toUpperCase() + speed.slice(1);
}

/** Get turn type label */
export function getTurnTypeLabel(angle) {
  const type = classifyTurnType(angle);
  const labels = {
    hairpin: "Hairpin",
    very_tight: "Very Tight",
    tight: "Tight",
    medium: "Medium",
    sweeper: "Sweeper",
    kink: "Kink",
    straight: "Straight"
  };
  return labels[type] || "Unknown";
}
