import { trackState } from "../state/trackState.js";
import { drawSegments } from "./SegmentRenderer.js";
import { generateRacingLine } from "../simulation/RacingLineGenerator.js";

/**
 * Draw the complete track preview with all visual elements
 * Similar to the curve editor but with enhanced visuals for preview
 */

export function drawTrackPreview(ctx, showRacingLine = false, showKerbs = false) {
    const path = trackState.generatedPath;
    const nodes = trackState.nodes;
    const turns = trackState.turns;
    const trackWidth = trackState.trackWidth;
    const closed = trackState.closed && nodes.length >= 3;

    if (!Array.isArray(path) || path.length < 2) return;

    const pts = path.filter((p) => p);
    const n = pts.length;

    if (n < 2) return;

    // Draw kerbs at corners (without full boundaries)
    if (showKerbs) {
        drawKerbs(ctx, nodes, turns, trackWidth, closed);
    }

    // Draw track surface
    drawTrackSurface(ctx, pts, trackWidth, closed, nodes, turns);

    // Draw racing line (ideal line through corners)
    if (showRacingLine) {
        drawRacingLine(ctx, pts, trackWidth, closed);
    }

    // Draw start/finish line
    if (nodes.length > 0) {
        drawStartFinishLine(ctx, pts[0], trackWidth);
    }

    // Turn markers removed for clean preview
}



/**
 * Draw track surface (gray asphalt)
 */
function drawTrackSurface(ctx, pts, trackWidth, closed, nodes, turns) {
    // Use the main segment renderer logic but with asphalt color
    drawSegments(ctx, "#3a3a3a");
}

/**
 * Draw racing line (orange line showing ideal path)
 */
/**
 * Draw racing line (orange line showing ideal path)
 */
function drawRacingLine(ctx, pts, trackWidth, closed) {
    // Generate optimal racing line points (now returns dense array)
    const racingPts = generateRacingLine(pts, closed, trackWidth);

    if (racingPts.length < 2) return;

    ctx.strokeStyle = "#ff4d00";
    ctx.lineWidth = 2; // Thin line
    ctx.setLineDash([5, 5]); // Dotted
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(racingPts[0].x, racingPts[0].y);

    for (let i = 1; i < racingPts.length; i++) {
        ctx.lineTo(racingPts[i].x, racingPts[i].y);
    }

    // Close loop for closed tracks
    if (closed) {
        ctx.lineTo(racingPts[0].x, racingPts[0].y);
    }

    ctx.stroke();
    ctx.setLineDash([]);
}

/**
 * Draw start/finish line
 */
function drawStartFinishLine(ctx, startPoint, trackWidth) {
    const halfWidth = trackWidth / 2;

    // Draw checkered pattern
    const numSquares = 8;
    const squareSize = trackWidth / numSquares;

    ctx.save();
    ctx.translate(startPoint.x, startPoint.y);

    for (let i = 0; i < numSquares; i++) {
        for (let j = 0; j < 2; j++) {
            const isWhite = (i + j) % 2 === 0;
            ctx.fillStyle = isWhite ? "#ffffff" : "#000000";
            ctx.fillRect(
                -halfWidth + i * squareSize,
                -2 + j * 4,
                squareSize,
                4
            );
        }
    }

    ctx.restore();
}

/**
 * Draw turn markers and information
 */
function drawKerbs(ctx, nodes, turns, trackWidth, closed) {
    const halfWidth = trackWidth / 2;

    nodes.forEach((node, i) => {
        const turn = turns[i];
        if (!turn) return;

        const nextIdx = closed ? (i + 1) % nodes.length : i + 1;
        if (!closed && nextIdx >= nodes.length) return;

        const prevIdx = closed ? (i - 1 + nodes.length) % nodes.length : i - 1;
        if (!closed && prevIdx < 0) return;

        const next = nodes[nextIdx];
        const prev = nodes[prevIdx];

        // Draw kerb pattern
        const dx = next.x - node.x;
        const dy = next.y - node.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 0.001) return;

        const perpX = -dy / dist;
        const perpY = dx / dist;

        // Kerb on inside of turn
        const kerbLength = Math.min(trackWidth * 2, dist * 0.3);
        const kerbWidth = halfWidth * 0.3;
        const kerbSegments = 8;

        for (let j = 0; j < kerbSegments; j++) {
            const t1 = j / kerbSegments;
            const t2 = (j + 1) / kerbSegments;

            const x1 = node.x + (dx / dist) * kerbLength * t1;
            const y1 = node.y + (dy / dist) * kerbLength * t1;
            const x2 = node.x + (dx / dist) * kerbLength * t2;
            const y2 = node.y + (dy / dist) * kerbLength * t2;

            // Determine if turn is left or right
            const crossProduct = (next.x - node.x) * (prev.y - node.y) - (next.y - node.y) * (prev.x - node.x);
            const side = crossProduct > 0 ? 1 : -1;

            ctx.fillStyle = j % 2 === 0 ? "#ff0000" : "#ffffff";
            ctx.beginPath();
            ctx.moveTo(x1 + perpX * halfWidth * side, y1 + perpY * halfWidth * side);
            ctx.lineTo(x2 + perpX * halfWidth * side, y2 + perpY * halfWidth * side);
            ctx.lineTo(x2 + perpX * (halfWidth + kerbWidth) * side, y2 + perpY * (halfWidth + kerbWidth) * side);
            ctx.lineTo(x1 + perpX * (halfWidth + kerbWidth) * side, y1 + perpY * (halfWidth + kerbWidth) * side);
            ctx.closePath();
            ctx.fill();
        }
    });
}
