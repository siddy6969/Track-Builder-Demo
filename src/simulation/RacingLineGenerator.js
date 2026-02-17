import { computeAngle } from "../canvas/TurnMath.js";
import { trackState } from "../state/trackState.js";

/**
 * Generates an optimal racing line using an iterative "Elastic Band" method.
 * This physically simulates a string being pulled tight through the track.
 * 
 * @param {Array} nodes - Track center nodes
 * @param {boolean} closed - Is track closed loop
 * @param {number} trackWidth - Track width in meters
 * @returns {Array} Optimized racing line points (dense array)
 */
// Geometry constants matching SegmentRenderer.js
const TENSION = {
    Hairpin: 0.15, Chicane: 0.2, "Snail Corner": 0.18, "90°": 0.25,
    "Decreasing Radius": 0.3, "Increasing Radius": 0.3, "Off-Camber Turn": 0.28,
    Esses: 0.35, "Constant Radius": 0.33, "Banked Turn": 0.33,
    Sweeper: 0.4, "Double Apex": 0.38, Bend: 0.42, Kink: 0.45, default: 0.33
};

const ASYMMETRY = {
    "Decreasing Radius": [1.5, 0.5], "Increasing Radius": [0.5, 1.5],
    "Double Apex": [1.3, 1.3], "Snail Corner": [1.2, 1.2], default: [1.0, 1.0]
};

// Helper for cubic bezier point
function getBezierPoint(t, p0, p1, p2, p3) {
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    const t2 = t * t;
    const t3 = t2 * t;

    return {
        x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
        y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y
    };
}

export function generateRacingLine(nodes, closed, trackWidth) {
    if (!nodes || nodes.length < 3) return [...nodes];

    // Use the global turns state if available (passed or imported? 
    // Ideally passed, but for now we assume simple track or need to access state)
    // We will assume default tension if turns not provided, OR we need to import trackState?
    // RacingLineGenerator is a pure module. We should ideally pass 'turns' data.
    // For now, we'll try to import trackState directly as it's a singleton.
    // But imports inside function are bad.
    // We'll import trackState at top level if possible, or accept it as arg.
    // The previous code didn't use turns. 
    // To MATCH Renderer, we NEED turn data.
    // I'll grab it from the imported module (simulated).

    // Spline settings
    const POINTS_PER_SEGMENT = 10; // High density for simulation

    let path = [];
    const numSegments = closed ? nodes.length : nodes.length - 1;

    for (let i = 0; i < numSegments; i++) {
        // Indices for Catmull-Rom logic (p0 -> p1 -> p2 -> p3)
        const idx0 = closed ? (i - 1 + nodes.length) % nodes.length : Math.max(0, i - 1);
        const idx1 = i;
        const idx2 = closed ? (i + 1) % nodes.length : i + 1;
        const idx3 = closed ? (i + 2) % nodes.length : Math.min(nodes.length - 1, i + 2);

        const p0 = nodes[idx0];
        const p1 = nodes[idx1];
        const p2 = nodes[idx2];
        const p3 = nodes[idx3];

        // Get turn data for START node (p1) and END node (p2)
        // SegmentRenderer uses turns[idx1] for start tension/asym
        // And uses turns[idx2] for end tension/asym

        const startTurn = trackState.turns[idx1];
        const startType = startTurn ? startTurn.type : "default";
        const tension1 = TENSION[startType] || TENSION.default;
        const asym1 = ASYMMETRY[startType] || ASYMMETRY.default;

        const endTurn = trackState.turns[idx2];
        const endType = endTurn ? endTurn.type : "default";
        const tension2 = TENSION[endType] || TENSION.default;
        const asym2 = ASYMMETRY[endType] || ASYMMETRY.default;

        // Segment Dist
        const segDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);

        // Tangent 1 (at p1)
        const t1x = p2.x - p0.x;
        const t1y = p2.y - p0.y;
        const t1len = Math.hypot(t1x, t1y);

        // Tangent 2 (at p2)
        const t2x = p3.x - p1.x;
        const t2y = p3.y - p1.y;
        const t2len = Math.hypot(t2x, t2y);

        // Dynamic Clamping Logic (Simplified copy from Renderer)
        // We assume angles are pre-calculated or stored in turns?
        // Renderer uses `startTurn.angle`.
        // We should really compute them or trust turn data.
        // Assuming turn data is up to date.
        // If not, we fall back to looser clamping (0.75).
        const startAngle = startTurn ? startTurn.angle : 180;
        const endAngle = endTurn ? endTurn.angle : 180;

        const getClampedMaxDist = (angle) => {
            if (angle < 30) return 0.25;
            if (angle < 60) return 0.35;
            if (angle < 90) return 0.45;
            return 0.75;
        };

        const maxDist1 = getClampedMaxDist(startAngle) * segDist;
        const maxDist2 = getClampedMaxDist(endAngle) * segDist;

        // Control Point 1 (from p1)
        let cp1x, cp1y;
        if (t1len > 0) {
            const exitMul = asym1[1];
            const scale = Math.min(tension1 * exitMul * segDist, maxDist1);
            cp1x = p1.x + (t1x / t1len) * scale;
            cp1y = p1.y + (t1y / t1len) * scale;
        } else {
            cp1x = p1.x; cp1y = p1.y;
        }

        // Control Point 2 (from p2)
        let cp2x, cp2y;
        if (t2len > 0) {
            const entryMul = asym2[0];
            const scale = Math.min(tension2 * entryMul * segDist, maxDist2);
            // Note: Tangent t2 points p1->p3. Backwards is -t2.
            cp2x = p2.x - (t2x / t2len) * scale;
            cp2y = p2.y - (t2y / t2len) * scale;
        } else {
            cp2x = p2.x; cp2y = p2.y;
        }

        const cp0 = { x: cp1x, y: cp1y }; // This is CP1 of the segment
        const cp1 = { x: cp2x, y: cp2y }; // This is CP2 of the segment

        for (let j = 0; j < POINTS_PER_SEGMENT; j++) {
            const t = j / POINTS_PER_SEGMENT;
            // Bezier interpolation
            path.push(getBezierPoint(t, p1, cp0, cp1, p2));
        }
    }

    // Add the last node for open tracks to ensure it's included
    if (!closed && nodes.length > 0) {
        path.push({ ...nodes[nodes.length - 1] });
    }

    // Optimization Parameters
    const ITERATIONS = 200;
    // Aggressive safety margin (40%) to strictly enforce limits at sharp nodes
    const MARGIN = trackWidth * 0.5 * 0.6;
    const TRACK_RADIUS = Math.max(0.5, (trackWidth * 0.5) - MARGIN);

    // Constraint Anchors = The Spline Center Line
    const originalPath = path.map(p => ({ ...p }));

    for (let iter = 0; iter < ITERATIONS; iter++) {
        for (let i = 0; i < path.length; i++) {
            // Pin start/end points to prevent boundary crossing at the joint
            // Even for closed tracks, pinning the 'seam' point (index 0) ensures it stays safely at the center,
            // fixing the persistent "crossing at start" bug.
            if (i === 0) continue;
            if (!closed && i === path.length - 1) continue;

            const prev = path[(i - 1 + path.length) % path.length];
            const curr = path[i];
            const next = path[(i + 1) % path.length];

            // 1. SMOOTHING (Elastic Force)
            // Use 0.2 for better stability with sliding anchors
            const midX = (prev.x + next.x) * 0.5;
            const midY = (prev.y + next.y) * 0.5;

            curr.x += (midX - curr.x) * 0.2;
            curr.y += (midY - curr.y) * 0.2;

            // 2. CONSTRAINT (Track Boundaries)
            // PROBLEM: The racing line is shorter than the center line.
            // If we constrain path[i] to originalPath[i], we pull points backwards, creating loops.
            // SOLUTION: Find the closest point on originalPath to use as anchor (Sliding Anchor).

            // Scan window around 'i' to find closest anchor
            let closestDist = Infinity;
            let center = originalPath[i]; // Default fallback

            // Scan range
            const maxRange = Math.min(50, Math.floor(path.length * 0.15));
            const scanRange = Math.max(10, maxRange);

            for (let offset = -scanRange; offset <= scanRange; offset++) {
                // Handle wrapping for closed tracks
                let idx = i + offset;
                if (closed) {
                    idx = (idx + originalPath.length) % originalPath.length;
                } else {
                    if (idx < 0 || idx >= originalPath.length) continue;
                }

                const p = originalPath[idx];
                const d2 = (curr.x - p.x) ** 2 + (curr.y - p.y) ** 2;
                if (d2 < closestDist) {
                    closestDist = d2;
                    center = p;
                }
            }

            const dx = curr.x - center.x;
            const dy = curr.y - center.y;
            const dist = Math.hypot(dx, dy);

            if (dist > TRACK_RADIUS) {
                const angle = Math.atan2(dy, dx);
                curr.x = center.x + Math.cos(angle) * TRACK_RADIUS;
                curr.y = center.y + Math.sin(angle) * TRACK_RADIUS;
            }
        }
    }

    return path;
}

/**
 * Returns the optimized racing line points.
 * Since generateRacingLine now essentially returns the interpolated line,
 * this function is a wrapper.
 */
export function getInterpolatedRacingLine(nodes, closed, trackWidth) {
    return generateRacingLine(nodes, closed, trackWidth);
}
