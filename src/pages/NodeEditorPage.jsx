import { useRef, useState } from "react";
import CanvasView from "../canvas/CanvasView.jsx";
import { trackState } from "../state/trackState.js";
import { screenToWorld } from "../canvas/Camera.js";
import { analyzeTurns } from "../canvas/TurnAnalyzer.js";
import { generatePath } from "../canvas/PathGenerator.js";

const HIT_RADIUS = 12;

export default function NodeEditorPage({ onBack, onNext }) {
  const draggingRef = useRef(null);
  const [, setRefresh] = useState(0);

  function refresh() {
    setRefresh((r) => r + 1);
  }

  const handlers = {
    onMouseDown(e, canvas) {
      const p = screenToWorld(e, canvas);

      const idx = trackState.nodes.findIndex(
        (n) => Math.hypot(n.x - p.x, n.y - p.y) < HIT_RADIUS
      );

      if (idx >= 0) {
        if (idx === 0 && trackState.nodes.length >= 3 && !trackState.closed) {
          trackState.closed = true;
          generatePath();
          analyzeTurns();
          refresh();
        } else {
          draggingRef.current = idx;
        }
      } else {
        trackState.closed = false;
        trackState.nodes.push({ x: p.x, y: p.y });
        analyzeTurns();
        generatePath();
        refresh();
      }
    },

    onMouseMove(e, canvas) {
      if (draggingRef.current === null) return;
      const p = screenToWorld(e, canvas);
      trackState.nodes[draggingRef.current] = { x: p.x, y: p.y };
      analyzeTurns();
      generatePath();
    },

    onMouseUp() {
      draggingRef.current = null;
    }
  };

  const nodeCount = trackState.nodes.length;

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <aside style={sidebar}>
        <h2 style={{ color: "#ff4d00" }}>NODE EDITOR</h2>
        <p style={{ color: "#aaa" }}>Click to add, drag to move</p>
        <p style={{ color: "#888", fontSize: 12, marginTop: 8 }}>
          {nodeCount} node{nodeCount !== 1 ? "s" : ""}
          {trackState.closed && " (closed)"}
        </p>
        <p style={{ color: "#666", fontSize: 11, marginTop: 4 }}>
          Click first node to close circuit
        </p>
        <div style={buttonRow}>
          <button style={navButton} onClick={onBack}>
            ← Back
          </button>
          <button
            style={{ ...navButton, ...primaryButton }}
            onClick={onNext}
            disabled={nodeCount < 2}
          >
            Next: Curves →
          </button>
        </div>
      </aside>

      <div style={{ flex: 1 }}>
        <CanvasView handlers={handlers} />
      </div>
    </div>
  );
}

const sidebar = {
  width: 300,
  padding: 24,
  background: "#0e0e0e",
  borderRight: "1px solid #222"
};

const buttonRow = {
  display: "flex",
  gap: 12,
  marginTop: 24
};

const navButton = {
  flex: 1,
  padding: "10px 16px",
  background: "#2a2a2a",
  border: "1px solid #444",
  borderRadius: 8,
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer"
};

const primaryButton = {
  background: "#ff4d00",
  borderColor: "#ff4d00"
};
