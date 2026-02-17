import { trackState } from "../state/trackState.js";

export function drawNodes(ctx) {
  // Dynamic scaling based on trackWidth so nodes are proportional to the track
  const baseRadius = Math.max(3, trackState.trackWidth * 1.2);
  const editingRadius = baseRadius * 1.3;
  const fontSize = Math.max(10, baseRadius * 2);

  ctx.font = `${fontSize}px monospace`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const editingIdx = trackState.editingNodeIndex;
  const nodes = trackState.nodes;
  const closed = trackState.closed && nodes.length >= 3;

  nodes.forEach((n, i) => {
    const x = n.x;
    const y = n.y;

    ctx.fillStyle = editingIdx === i ? "#ff4d00" : "#00e5ff";
    ctx.beginPath();
    ctx.arc(x, y, editingIdx === i ? editingRadius : baseRadius, 0, Math.PI * 2);
    ctx.fill();

    const turn = trackState.turns[i];
    const nextIdx = closed ? (i + 1) % nodes.length : i + 1;
    const hasNext = closed || nextIdx < nodes.length;

    let labelY = y - (baseRadius + 4);
    const labels = [];

    if (turn) {
      labels.push(`${turn.angle}°`);
    }

    if (hasNext) {
      const nextNode = nodes[nextIdx];
      const distance = Math.hypot(nextNode.x - x, nextNode.y - y);
      labels.push(`${distance.toFixed(1)}m`);
    }

    labels.forEach((label, idx) => {
      ctx.fillStyle = idx === 0 ? "#0f0" : "#ffa500";
      ctx.fillText(label, x + (baseRadius + 4), labelY + idx * (fontSize + 2));
    });
  });
}
