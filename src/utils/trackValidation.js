/**
 * Track validation utilities
 * Detects self-intersections and other track issues
 */

/**
 * Check if two line segments intersect
 * Returns true if segments (p1,p2) and (p3,p4) intersect
 */
function segmentsIntersect(p1, p2, p3, p4) {
    const d1x = p2.x - p1.x;
    const d1y = p2.y - p1.y;
    const d2x = p4.x - p3.x;
    const d2y = p4.y - p3.y;

    const denominator = d1x * d2y - d1y * d2x;

    // Parallel or coincident
    if (Math.abs(denominator) < 0.0001) return false;

    const t = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / denominator;
    const u = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / denominator;

    // Intersection occurs if both t and u are between 0 and 1
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}

/**
 * Sample points along a bezier curve
 */
function sampleBezierCurve(p0, cp1, cp2, p1, samples = 10) {
    const points = [];
    for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;

        const x = mt3 * p0.x + 3 * mt2 * t * cp1.x + 3 * mt * t2 * cp2.x + t3 * p1.x;
        const y = mt3 * p0.y + 3 * mt2 * t * cp1.y + 3 * mt * t2 * cp2.y + t3 * p1.y;

        points.push({ x, y });
    }
    return points;
}

/**
 * Check if track has self-intersections
 * Returns array of intersection points, or empty array if no intersections
 */
export function detectSelfIntersections(path, trackWidth) {
    if (!path || path.length < 4) return [];

    const intersections = [];
    const segments = [];

    // Sample the path into line segments
    for (let i = 0; i < path.length - 1; i++) {
        segments.push({
            start: path[i],
            end: path[i + 1],
            index: i
        });
    }

    // Check each segment against non-adjacent segments
    for (let i = 0; i < segments.length; i++) {
        for (let j = i + 2; j < segments.length; j++) {
            // Skip adjacent segments
            if (Math.abs(i - j) <= 1) continue;

            // Skip if this is a closed track and we're comparing first and last
            if (i === 0 && j === segments.length - 1) continue;

            const seg1 = segments[i];
            const seg2 = segments[j];

            if (segmentsIntersect(seg1.start, seg1.end, seg2.start, seg2.end)) {
                intersections.push({
                    segment1: i,
                    segment2: j
                });
            }
        }
    }

    return intersections;
}

/**
 * Check if a node placement would create an intersection
 */
export function wouldCreateIntersection(nodes, newNode, trackWidth) {
    if (nodes.length < 2) return false;

    // Create temporary path with new node
    const testNodes = [...nodes, newNode];

    // Simple check: does the new segment intersect with any existing segment?
    const newSegStart = nodes[nodes.length - 1];
    const newSegEnd = newNode;

    for (let i = 0; i < nodes.length - 2; i++) {
        if (segmentsIntersect(nodes[i], nodes[i + 1], newSegStart, newSegEnd)) {
            return true;
        }
    }

    return false;
}

/**
 * Check if track width would cause overlap
 * Returns true if track is too wide for the current geometry
 */
export function checkTrackWidthOverlap(nodes, trackWidth) {
    if (nodes.length < 3) return false;

    // Check if any two parallel track edges would overlap
    // This is a simplified check - just ensures minimum distance between nodes
    const minDistance = trackWidth * 2;

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 2; j < nodes.length; j++) {
            const dist = Math.hypot(nodes[j].x - nodes[i].x, nodes[j].y - nodes[i].y);
            if (dist < minDistance) {
                return true; // Nodes too close, track might overlap
            }
        }
    }

    return false;
}

/**
 * Get validation warnings for current track
 */
export function getTrackWarnings(nodes, path, trackWidth) {
    const warnings = [];

    // Check for self-intersections
    if (path && path.length > 0) {
        const intersections = detectSelfIntersections(path, trackWidth);
        if (intersections.length > 0) {
            warnings.push({
                type: 'intersection',
                message: `Track has ${intersections.length} self-intersection(s)`,
                severity: 'error'
            });
        }
    }

    // Check for track width overlap
    if (checkTrackWidthOverlap(nodes, trackWidth)) {
        warnings.push({
            type: 'width',
            message: 'Track width may cause overlaps - nodes are too close',
            severity: 'warning'
        });
    }

    // Check for very sharp angles
    for (let i = 1; i < nodes.length - 1; i++) {
        const p0 = nodes[i - 1];
        const p1 = nodes[i];
        const p2 = nodes[i + 1];

        const v1x = p0.x - p1.x;
        const v1y = p0.y - p1.y;
        const v2x = p2.x - p1.x;
        const v2y = p2.y - p1.y;

        const dot = v1x * v2x + v1y * v2y;
        const len1 = Math.hypot(v1x, v1y);
        const len2 = Math.hypot(v2x, v2y);

        if (len1 > 0 && len2 > 0) {
            const angle = Math.acos(Math.max(-1, Math.min(1, dot / (len1 * len2))));
            const angleDeg = (angle * 180) / Math.PI;

            if (angleDeg < 15) {
                warnings.push({
                    type: 'sharp_angle',
                    message: `Very sharp angle at node ${i + 1} (${angleDeg.toFixed(0)}°)`,
                    severity: 'warning',
                    nodeIndex: i
                });
            }
        }
    }

    return warnings;
}
