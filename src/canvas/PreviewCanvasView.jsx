import { useEffect, useRef } from "react";
import { camera, applyCamera } from "./Camera.js";
import { drawGrid } from "./GridRenderer.js";
import { drawTrackPreview } from "./TrackPreviewRenderer.js";
import { trackState } from "../state/trackState.js";

export default function PreviewCanvasView() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        function resize() {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;

            // Auto-fit camera to track bounds
            fitCameraToTrack();
        }

        function fitCameraToTrack() {
            const nodes = trackState.nodes;
            if (nodes.length === 0) {
                camera.x = 0;
                camera.y = 0;
                camera.zoom = 1;
                return;
            }

            // Calculate bounds
            let minX = Infinity, maxX = -Infinity;
            let minY = Infinity, maxY = -Infinity;

            nodes.forEach(node => {
                minX = Math.min(minX, node.x);
                maxX = Math.max(maxX, node.x);
                minY = Math.min(minY, node.y);
                maxY = Math.max(maxY, node.y);
            });

            const centerX = (minX + maxX) / 2;
            const centerY = (minY + maxY) / 2;
            const width = maxX - minX || 100;
            const height = maxY - minY || 100;

            // Add padding
            const padding = trackState.trackWidth * 4;
            const paddedWidth = width + padding;
            const paddedHeight = height + padding;

            // Calculate zoom to fit
            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;
            const zoomX = canvasWidth / paddedWidth;
            const zoomY = canvasHeight / paddedHeight;
            const zoom = Math.min(zoomX, zoomY, 2); // Cap at 2x

            camera.x = centerX;
            camera.y = centerY;
            camera.zoom = zoom;
        }

        resize();
        window.addEventListener("resize", resize);

        function draw() {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            applyCamera(ctx);
            drawGrid(ctx);
            drawTrackPreview(ctx);

            requestAnimationFrame(draw);
        }

        draw();

        function wheel(e) {
            e.preventDefault();
            camera.zoom *= e.deltaY > 0 ? 0.9 : 1.1;
            camera.zoom = Math.min(5, Math.max(0.3, camera.zoom));
        }

        let isDragging = false;
        let lastX = 0;
        let lastY = 0;

        function mouseDown(e) {
            isDragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
        }

        function mouseMove(e) {
            if (!isDragging) return;

            const dx = e.clientX - lastX;
            const dy = e.clientY - lastY;

            camera.x -= dx / camera.zoom;
            camera.y -= dy / camera.zoom;

            lastX = e.clientX;
            lastY = e.clientY;
        }

        function mouseUp() {
            isDragging = false;
        }

        canvas.addEventListener("wheel", wheel, { passive: false });
        canvas.addEventListener("mousedown", mouseDown);
        canvas.addEventListener("mousemove", mouseMove);
        canvas.addEventListener("mouseup", mouseUp);
        canvas.addEventListener("mouseleave", mouseUp);

        return () => {
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("wheel", wheel);
            canvas.removeEventListener("mousedown", mouseDown);
            canvas.removeEventListener("mousemove", mouseMove);
            canvas.removeEventListener("mouseup", mouseUp);
            canvas.removeEventListener("mouseleave", mouseUp);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: "100%",
                height: "100%",
                display: "block",
                cursor: "grab",
                pointerEvents: "auto",
                background: "#0b0b0b"
            }}
        />
    );
}
