import { trackState } from "../state/trackState.js";

export function generatePath() {
  const pts = [...trackState.nodes];

  if (trackState.closed && pts.length >= 3) {
    pts.push({ ...pts[0] });
  }

  trackState.generatedPath = pts;
}
