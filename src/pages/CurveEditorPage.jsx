import { useState, useEffect } from "react";
import CanvasView from "../canvas/CanvasView.jsx";
import CurvePanel from "../ui/CurvePanel.jsx";
import WarningBanner from "../ui/WarningBanner.jsx";
import { trackState } from "../state/trackState.js";
import { screenToWorld } from "../canvas/Camera.js";
import { computeAngle } from "../canvas/TurnMath.js";
import { getTrackWarnings } from "../utils/trackValidation.js";

const HIT_RADIUS = 12;

export default function CurveEditorPage({ onBack, onNext }) {
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [warnings, setWarnings] = useState([]);

  // Check for track warnings
  useEffect(() => {
    const checkWarnings = () => {
      const trackWarnings = getTrackWarnings(
        trackState.nodes,
        trackState.generatedPath,
        trackState.trackWidth
      );
      setWarnings(trackWarnings);
    };
    checkWarnings();
    const interval = setInterval(checkWarnings, 500);
    return () => clearInterval(interval);
  }, []);

  /** When we click node idx, we edit the curve at that node */
  const getEditNodeIndex = (clickedIdx) => {
    return clickedIdx; // Edit the node that was clicked
  };

  const canSelectNode = (idx) => {
    const n = trackState.nodes.length;
    if (n < 3) return false;
    // For closed tracks, any node can be selected
    // For open tracks, we can't select the first node (no curve before it)
    if (trackState.closed) return idx >= 0 && idx < n;
    return idx > 0 && idx < n;
  };

  const turn = selectedNodeIndex != null && canSelectNode(selectedNodeIndex)
    ? (() => {
      const n = trackState.nodes.length;
      const closed = trackState.closed;
      const editIdx = getEditNodeIndex(selectedNodeIndex);
      const prev = (i) => (closed ? (i - 1 + n) % n : i - 1);
      const next = (i) => (closed ? (i + 1) % n : i + 1);
      const pi = prev(editIdx);
      const ni = next(editIdx);
      return {
        index: editIdx,
        clickedNodeIndex: selectedNodeIndex,
        angle: computeAngle(
          trackState.nodes[pi],
          trackState.nodes[editIdx],
          trackState.nodes[ni]
        ),
        type: selectedType ?? trackState.turns[editIdx]?.type ?? null
      };
    })()
    : null;

  function onDown(e, canvas) {
    const p = screenToWorld(e, canvas);

    const idx = trackState.nodes.findIndex(
      (n) => Math.hypot(n.x - p.x, n.y - p.y) < HIT_RADIUS
    );

    if (canSelectNode(idx)) {
      trackState.previewCurve = null;
      setSelectedNodeIndex(idx);
      const editIdx = getEditNodeIndex(idx);
      trackState.editingNodeIndex = editIdx;
      setSelectedType(trackState.turns[editIdx]?.type ?? null);
    }
  }

  function handleTypeSelect(type) {
    setSelectedType(type);
    if (turn) {
      trackState.previewCurve = { index: turn.index, type };
    }
  }

  function handleSave() {
    if (turn) {
      const bankAngle = turn.type === "Banked Turn" ? 15 : turn.type === "Off-Camber Turn" ? -5 : undefined;
      trackState.turns[turn.index] = {
        ...trackState.turns[turn.index],
        angle: turn.angle,
        type: turn.type,
        ...(bankAngle != null && { bankAngle })
      };
      trackState.previewCurve = null;
      trackState.editingNodeIndex = null;
      setSelectedNodeIndex(null);
      setSelectedType(null);
    }
  }

  function handleCancel() {
    trackState.previewCurve = null;
    trackState.editingNodeIndex = null;
    setSelectedNodeIndex(null);
    setSelectedType(null);
  }

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <WarningBanner warnings={warnings} />
      <CurvePanel
        turn={turn}
        selectedType={selectedType}
        onTypeSelect={handleTypeSelect}
        onSave={handleSave}
        onCancel={handleCancel}
        onBack={onBack}
        onNext={onNext}
      />
      <div style={{ flex: 1 }}>
        <CanvasView handlers={{ onMouseDown: onDown }} />
      </div>
    </div>
  );
}
