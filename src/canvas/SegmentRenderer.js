import { trackState } from "../state/trackState.js";

/**
 * Simplified curve geometry - Cleaner Catmull-Rom splines
 * Prevents overlaps and weird curves by clamping control point distances
 */
const TENSION = {
  Hairpin: 0.15,
  Chicane: 0.2,
  "Snail Corner": 0.18,
  "90°": 0.25,
  "Decreasing Radius": 0.3,
  "Increasing Radius": 0.3,
  "Off-Camber Turn": 0.28,
  Esses: 0.35,
  "Constant Radius": 0.33,
  "Banked Turn": 0.33,
  Sweeper: 0.4,
  "Double Apex": 0.38,
  Bend: 0.42,
  Kink: 0.45,
  default: 0.33
};

/**
 * Asymmetry multipliers [entry, exit]
 * Controls how the curve shape changes from entry to exit
 */
const ASYMMETRY = {
  "Decreasing Radius": [1.5, 0.5],  // Wide entry, tight exit
  "Increasing Radius": [0.5, 1.5],  // Tight entry, wide exit
  "Double Apex": [1.3, 1.3],        // Extended both sides
  "Snail Corner": [1.2, 1.2],       // Gradual entry/exit
  default: [1.0, 1.0]
};

/** Maximum control point distance as fraction of segment length */
const MAX_CONTROL_DISTANCE = 0.75; // Increased to allow decreasing/increasing radius shapes

export function drawSegments(ctx, color = "#ffffff") {
  const nodes = trackState.nodes;
  const turns = trackState.turns;
  const closed = trackState.closed && nodes.length >= 3;

  if (nodes.length < 2) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = trackState.trackWidth;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";

  // Use nodes directly to avoid issue with duplicate closing point in generatedPath
  // Determine number of segments to draw
  // If open: n-1 segments (0 to n-2)
  // If closed: n segments (0 to n-1)
  const numSegments = closed ? nodes.length : nodes.length - 1;

  ctx.beginPath();
  ctx.moveTo(nodes[0].x, nodes[0].y);

  for (let i = 0; i < numSegments; i++) {
    // Indices for Catmull-Rom spline (p0 -> p1 -> p2 -> p3)
    // We are drawing segment p1 -> p2
    const idx0 = closed ? (i - 1 + nodes.length) % nodes.length : Math.max(0, i - 1);
    const idx1 = i;
    const idx2 = closed ? (i + 1) % nodes.length : i + 1;
    const idx3 = closed ? (i + 2) % nodes.length : Math.min(nodes.length - 1, i + 2);

    const p0 = nodes[idx0];
    const p1 = nodes[idx1];
    const p2 = nodes[idx2];
    const p3 = nodes[idx3];

    // Determine turn types and angles
    const preview = trackState.previewCurve;

    // Start node turn (idx1)
    const startTurn = turns[idx1];
    const startType = (preview?.index === idx1 ? preview.type : null) ?? startTurn?.type;
    const startAngle = (preview?.index === idx1 ? preview.angle : null) ?? startTurn?.angle ?? 180;

    // End node turn (idx2)
    const endTurn = turns[idx2];
    const endType = (preview?.index === idx2 ? preview.type : null) ?? endTurn?.type;
    const endAngle = (preview?.index === idx2 ? preview.angle : null) ?? endTurn?.angle ?? 180;

    // Segment length
    const segDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

    if (segDist === 0) {
      ctx.lineTo(p2.x, p2.y);
      continue;
    }

    // Get tension and asymmetry values
    const tension1 = startType ? (TENSION[startType] ?? TENSION.default) : TENSION.default;
    const tension2 = endType ? (TENSION[endType] ?? TENSION.default) : TENSION.default;

    const asym1 = startType ? (ASYMMETRY[startType] ?? ASYMMETRY.default) : ASYMMETRY.default;
    const asym2 = endType ? (ASYMMETRY[endType] ?? ASYMMETRY.default) : ASYMMETRY.default;

    // DYNAMIC CLAMPING: Stricter limits for sharp turns to prevent loops
    const getClampedMaxDist = (angle) => {
      if (angle < 30) return 0.25;  // Very sharp hairpin -> very short handles
      if (angle < 60) return 0.35;  // Sharp turn -> short handles
      if (angle < 90) return 0.45;  // 90 degree -> medium handles
      return 0.75;                  // Open turn -> long handles
    };

    const maxDist1 = getClampedMaxDist(startAngle) * segDist;
    const maxDist2 = getClampedMaxDist(endAngle) * segDist;

    // Calculate Catmull-Rom tangents
    // Tangent at p1 points from p0 toward p2
    const t1x = p2.x - p0.x;
    const t1y = p2.y - p0.y;
    const t1len = Math.hypot(t1x, t1y);

    // Tangent at p2 points from p1 toward p3
    const t2x = p3.x - p1.x;
    const t2y = p3.y - p1.y;
    const t2len = Math.hypot(t2x, t2y);

    // Control point 1 (from p1) - uses EXIT multiplier from start node
    let cp1x, cp1y;
    if (t1len > 0) {
      const exitMul = asym1[1]; // Exit multiplier
      // Use dynamic maxDist1 instead of global constant
      const scale = Math.min(tension1 * exitMul * segDist, maxDist1);
      cp1x = p1.x + (t1x / t1len) * scale;
      cp1y = p1.y + (t1y / t1len) * scale;
    } else {
      cp1x = p1.x;
      cp1y = p1.y;
    }

    // Control point 2 (from p2, pointing back) - uses ENTRY multiplier from end node
    let cp2x, cp2y;
    if (t2len > 0) {
      const entryMul = asym2[0]; // Entry multiplier
      // Use dynamic maxDist2 instead of global constant
      const scale = Math.min(tension2 * entryMul * segDist, maxDist2);
      cp2x = p2.x - (t2x / t2len) * scale;
      cp2y = p2.y - (t2y / t2len) * scale;
    } else {
      cp2x = p2.x;
      cp2y = p2.y;
    }

    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
  }

  ctx.stroke();
}

/**
 * Draw control point handles for visual feedback
 */
export function drawHandles(ctx) {
  const nodes = trackState.nodes;
  const turns = trackState.turns;
  const closed = trackState.closed && nodes.length >= 3;

  if (nodes.length < 2) return;

  ctx.lineWidth = 1;
  const numSegments = closed ? nodes.length : nodes.length - 1;

  for (let i = 0; i < numSegments; i++) {
    const idx0 = closed ? (i - 1 + nodes.length) % nodes.length : Math.max(0, i - 1);
    const idx1 = i;
    const idx2 = closed ? (i + 1) % nodes.length : i + 1;
    const idx3 = closed ? (i + 2) % nodes.length : Math.min(nodes.length - 1, i + 2);

    const p0 = nodes[idx0];
    const p1 = nodes[idx1];
    const p2 = nodes[idx2];
    const p3 = nodes[idx3];

    // Determine turn types and angles (Logic duplicated from drawSegments for self-containment)
    const preview = trackState.previewCurve;
    const startTurn = turns[idx1];
    const startType = (preview?.index === idx1 ? preview.type : null) ?? startTurn?.type;
    const startAngle = (preview?.index === idx1 ? preview.angle : null) ?? startTurn?.angle ?? 180;
    const endTurn = turns[idx2];
    const endType = (preview?.index === idx2 ? preview.type : null) ?? endTurn?.type;
    const endAngle = (preview?.index === idx2 ? preview.angle : null) ?? endTurn?.angle ?? 180;

    const segDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
    if (segDist === 0) continue;

    const tension1 = startType ? (TENSION[startType] ?? TENSION.default) : TENSION.default;
    const tension2 = endType ? (TENSION[endType] ?? TENSION.default) : TENSION.default;
    const asym1 = startType ? (ASYMMETRY[startType] ?? ASYMMETRY.default) : ASYMMETRY.default;
    const asym2 = endType ? (ASYMMETRY[endType] ?? ASYMMETRY.default) : ASYMMETRY.default;

    const getClampedMaxDist = (angle) => {
      if (angle < 30) return 0.25;
      if (angle < 60) return 0.35;
      if (angle < 90) return 0.45;
      return 0.75;
    };

    const maxDist1 = getClampedMaxDist(startAngle) * segDist;
    const maxDist2 = getClampedMaxDist(endAngle) * segDist;

    const t1x = p2.x - p0.x;
    const t1y = p2.y - p0.y;
    const t1len = Math.hypot(t1x, t1y);
    const t2x = p3.x - p1.x;
    const t2y = p3.y - p1.y;
    const t2len = Math.hypot(t2x, t2y);

    let cp1x, cp1y;
    if (t1len > 0) {
      const exitMul = asym1[1];
      const scale = Math.min(tension1 * exitMul * segDist, maxDist1);
      cp1x = p1.x + (t1x / t1len) * scale;
      cp1y = p1.y + (t1y / t1len) * scale;
    } else {
      cp1x = p1.x;
      cp1y = p1.y;
    }

    let cp2x, cp2y;
    if (t2len > 0) {
      const entryMul = asym2[0];
      const scale = Math.min(tension2 * entryMul * segDist, maxDist2);
      cp2x = p2.x - (t2x / t2len) * scale;
      cp2y = p2.y - (t2y / t2len) * scale;
    } else {
      cp2x = p2.x;
      cp2y = p2.y;
    }

    // Draw Handles
    ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(cp1x, cp1y);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 0, 255, 0.3)";
    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(cp2x, cp2y);
    ctx.stroke();

    // Handle dots
    ctx.fillStyle = "#00ffff";
    ctx.beginPath();
    ctx.arc(cp1x, cp1y, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ff00ff";
    ctx.beginPath();
    ctx.arc(cp2x, cp2y, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}
