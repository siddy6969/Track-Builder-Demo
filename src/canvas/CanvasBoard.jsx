import { useEffect, useRef } from "react";
import { trackState } from "../state/trackState.js";
import { drawGrid } from "./GridRenderer.js";
import { drawNodes } from "./NodeRenderer.js";
import { drawSegments } from "./SegmentRenderer.js";
import { analyzeTurns } from "./TurnAnalyzer.js";
import { generatePath } from "./PathGenerator.js";

export default function CanvasBoard({ step }) {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = trackState.grid.cols * trackState.grid.cellSize;
    canvas.height = trackState.grid.rows * trackState.grid.cellSize;

    redraw();

    canvas.onmousedown = (e) => {
      if (step !== "turns") return;

      const { x, y } = getMouse(e);
      trackState.draggingNodeIndex = findNode(x, y);
    };

    canvas.onmousemove = (e) => {
      if (trackState.draggingNodeIndex === null) return;

      const { x, y } = getMouse(e);
      const size = trackState.grid.cellSize;

      trackState.nodes[trackState.draggingNodeIndex] = {
        x: Math.round(x / size),
        y: Math.round(y / size)
      };

      analyzeTurns();
      generatePath();
      redraw();
    };

    canvas.onmouseup = () => {
      trackState.draggingNodeIndex = null;
    };

    canvas.onclick = (e) => {
      if (step !== "nodes") return;

      const { x, y } = getMouse(e);
      const size = trackState.grid.cellSize;

      trackState.nodes.push({
        x: Math.round(x / size),
        y: Math.round(y / size)
      });

      analyzeTurns();
      generatePath();
      redraw();
    };

    function redraw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(ctx);
      drawSegments(ctx);
      drawNodes(ctx);
    }

    function getMouse(e) {
      const r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function findNode(mx, my) {
      const size = trackState.grid.cellSize;
      return trackState.nodes.findIndex((n) => {
        const nx = (n.x + 0.5) * size;
        const ny = (n.y + 0.5) * size;
        return Math.hypot(mx - nx, my - ny) < 8;
      });
    }
  }, [step]);

  return <canvas ref={canvasRef} style={{ background: "#0b0b0b" }} />;
}
