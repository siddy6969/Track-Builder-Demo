import { trackState } from "../state/trackState.js";

export function analyzeTurns() {
  const nodes = trackState.nodes;
  const n = nodes.length;
  const closed = trackState.closed && n >= 3;

  if (n < 3) return;

  const prev = (i) => (closed ? (i - 1 + n) % n : i - 1);
  const next = (i) => (closed ? (i + 1) % n : i + 1);

  for (let i = 0; i < n; i++) {
    const pi = prev(i);
    const ni = next(i);
    if (!closed && (pi < 0 || ni >= n)) continue;

    const a = nodes[pi];
    const b = nodes[i];
    const c = nodes[ni];

    const angle = calculateAngle(a, b, c);
    const existing = trackState.turns[i];

    trackState.turns[i] = {
      ...existing,
      angle,
      type: existing?.type ?? (angle < 30 ? "Hairpin" : angle < 60 ? "90°" : angle < 120 ? "Constant Radius" : "Sweeper")
    };
  }
}

function calculateAngle(a, b, c) {
  const v1 = { x: a.x - b.x, y: a.y - b.y };
  const v2 = { x: c.x - b.x, y: c.y - b.y };

  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);

  return Math.round((Math.acos(dot / mag) * 180) / Math.PI);
}
