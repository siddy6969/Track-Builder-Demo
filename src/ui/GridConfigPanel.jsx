import { trackState } from "../state/trackState.js";

export default function GridConfigPanel() {
  return (
    <>
      <label>Grid Width (m)</label>
      <input
        type="number"
        value={trackState.grid.cols}
        onChange={(e) => (trackState.grid.cols = +e.target.value)}
      />

      <label>Grid Height (m)</label>
      <input
        type="number"
        value={trackState.grid.rows}
        onChange={(e) => (trackState.grid.rows = +e.target.value)}
      />

      <label>Track Width (m)</label>
      <input
        type="number"
        value={trackState.trackWidth}
        onChange={(e) => (trackState.trackWidth = +e.target.value)}
      />
    </>
  );
}
