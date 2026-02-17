import { useEffect, useRef } from "react";
import { camera, applyCamera } from "./Camera.js";
import { drawGrid } from "./GridRenderer.js";
import { drawNodes } from "./NodeRenderer.js";
import { drawSegments, drawHandles } from "./SegmentRenderer.js";

export default function CanvasView({ handlers }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resize() {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      applyCamera(ctx);
      drawGrid(ctx);
      drawSegments(ctx);
      drawHandles(ctx);
      drawNodes(ctx);

      requestAnimationFrame(draw);
    }

    draw();

    function wheel(e) {
      e.preventDefault();
      camera.zoom *= e.deltaY > 0 ? 0.9 : 1.1;
      camera.zoom = Math.min(5, Math.max(0.3, camera.zoom));
    }

    canvas.addEventListener("wheel", wheel, { passive: false });

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("wheel", wheel);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={(e) => handlers?.onMouseDown?.(e, canvasRef.current)}
      onMouseMove={(e) => handlers?.onMouseMove?.(e, canvasRef.current)}
      onMouseUp={(e) => handlers?.onMouseUp?.(e, canvasRef.current)}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        cursor: "crosshair",
        pointerEvents: "auto",
        background: "#0b0b0b"
      }}
    />
  );
}
