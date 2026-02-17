import { useRef, useEffect, useState } from "react";
import PreviewCanvasView from "../canvas/PreviewCanvasView.jsx";
import { exportTrackJSON, importTrackJSON } from "../utils/trackData.js";

import { trackState } from "../state/trackState.js";
import { generatePath } from "../canvas/PathGenerator.js";
import { analyzeTurns } from "../canvas/TurnAnalyzer.js";

export default function PreviewPage({ onBack, onSimulate }) {
  const fileInputRef = useRef(null);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    generatePath();
    analyzeTurns();

    // Debug info
    const path = trackState.generatedPath;
    const nodes = trackState.nodes;
    setDebugInfo(`Nodes: ${nodes.length}, Path: ${path?.length || 0}, Closed: ${trackState.closed}`);
  }, []);

  function handleExport() {
    const json = exportTrackJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "track.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result;
      if (json && typeof json === "string") {
        const success = importTrackJSON(json);
        if (success) {
          generatePath();
          analyzeTurns();
          window.location.reload();
        } else {
          alert("Failed to import track file");
        }
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div style={{ display: "flex", height: "100%" }}>
      <aside style={sidebar}>
        <h2 style={{ color: "#ff4d00" }}>TRACK PREVIEW</h2>

        <div style={infoSection}>
          <p style={infoLabel}>Track Info</p>
          <p style={infoText}>{trackState.nodes.length} nodes</p>
          <p style={infoText}>{trackState.closed ? "Closed" : "Open"} circuit</p>
          <p style={infoText}>Width: {trackState.trackWidth}m</p>
          {trackState.nodes.length === 0 && (
            <p style={{ ...infoText, color: "#ff4d00", marginTop: 8 }}>
              No track data. Go back and create a track first.
            </p>
          )}
          <p style={{ ...infoText, fontSize: 10, color: "#666", marginTop: 8 }}>{debugInfo}</p>
        </div>

        <div style={infoSection}>
          <p style={infoLabel}>Controls</p>
          <p style={infoText}>• Scroll to zoom</p>
          <p style={infoText}>• Click + drag to pan</p>
        </div>

        <div style={buttonGroup}>
          <button style={actionButton} onClick={handleExport}>
            Export JSON
          </button>
          <button style={actionButton} onClick={handleImport}>
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>

        <div style={buttonGroup}>
          <button
            style={{ ...navButton, background: '#4CAF50', borderColor: '#4CAF50' }}
            onClick={onSimulate}
            disabled={trackState.nodes.length === 0}
          >
            🏎️ Simulate →
          </button>
        </div>

        <div style={buttonGroup}>
          <button style={navButton} onClick={onBack}>
            ← Back to Curves
          </button>
        </div>
      </aside>

      <div style={{ flex: 1 }}>
        {trackState.nodes.length > 0 ? (
          <PreviewCanvasView />
        ) : (
          <div style={noTrackMessage}>
            <p style={{ color: "#ff4d00", fontSize: 18, marginBottom: 8 }}>No Track Data</p>
            <p style={{ color: "#aaa", fontSize: 14 }}>Create a track in the previous steps first</p>
          </div>
        )}
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

const infoSection = {
  marginTop: 24,
  marginBottom: 24,
  padding: 16,
  background: "#1a1a1a",
  borderRadius: 8
};

const infoLabel = {
  color: "#ff4d00",
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 8,
  textTransform: "uppercase",
  letterSpacing: 1
};

const infoText = {
  color: "#aaa",
  fontSize: 13,
  marginBottom: 4
};

const buttonGroup = {
  display: "flex",
  flexDirection: "column",
  gap: 12,
  marginTop: 16
};

const actionButton = {
  width: "100%",
  padding: "12px 16px",
  background: "#2a2a2a",
  border: "1px solid #444",
  borderRadius: 8,
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer"
};

const navButton = {
  width: "100%",
  padding: "12px 16px",
  background: "#ff4d00",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
  marginTop: 24
};

const noTrackMessage = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100%",
  background: "#0b0b0b"
};

