export const camera = {
  x: 0,
  y: 0,
  zoom: 1
};

export function applyCamera(ctx) {
  ctx.setTransform(
    camera.zoom,
    0,
    0,
    camera.zoom,
    -camera.x * camera.zoom,
    -camera.y * camera.zoom
  );
}

export function screenToWorld(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (e.clientX - rect.left) / camera.zoom + camera.x,
    y: (e.clientY - rect.top) / camera.zoom + camera.y
  };
}
