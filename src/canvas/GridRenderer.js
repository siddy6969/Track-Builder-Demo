import { trackState } from "../state/trackState.js";

export function drawGrid(ctx) {
  const { rows, cols, cellSize } = trackState.grid;

  for (let i = 0; i <= cols; i++) {
    ctx.strokeStyle = i % 10 === 0 ? "rgba(255,165,0,.35)" : "rgba(255,165,0,.06)";
    ctx.lineWidth = i % 10 === 0 ? 1.2 : 0.5;
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, rows * cellSize);
    ctx.stroke();
  }

  for (let j = 0; j <= rows; j++) {
    ctx.strokeStyle = j % 10 === 0 ? "rgba(255,165,0,.35)" : "rgba(255,165,0,.06)";
    ctx.lineWidth = j % 10 === 0 ? 1.2 : 0.5;
    ctx.beginPath();
    ctx.moveTo(0, j * cellSize);
    ctx.lineTo(cols * cellSize, j * cellSize);
    ctx.stroke();
  }
}
