import { useState } from "react";
import { trackState } from "../state/trackState.js";

export default function ConfigPage({ onNext }) {
  const [cols, setCols] = useState(trackState.grid.cols);
  const [rows, setRows] = useState(trackState.grid.rows);
  const [trackWidth, setTrackWidth] = useState(trackState.trackWidth);

  function createTrack() {
    trackState.grid.cols = cols;
    trackState.grid.rows = rows;
    trackState.trackWidth = trackWidth;
    trackState.nodes = [];
    trackState.closed = false;
    trackState.turns = {};
    trackState.previewCurve = null;
    trackState.editingNodeIndex = null;
    onNext();
  }

  return (
    <div style={page}>
      <div style={card}>
        <h1 style={logo}>
          RAPID<span style={{ color: "#ff4d00" }}>LAPS</span>
        </h1>
        <p style={subtitle}>TRACK CONFIGURATION</p>

        <Field label="GRID COLUMNS">
          <input value={cols} onChange={e => setCols(+e.target.value)} />
        </Field>

        <Field label="GRID ROWS">
          <input value={rows} onChange={e => setRows(+e.target.value)} />
        </Field>

        <Field label="TRACK WIDTH (m)">
          <input value={trackWidth} onChange={e => setTrackWidth(+e.target.value)} />
        </Field>

        <button style={cta} onClick={createTrack}>
          INITIALIZE TRACK
        </button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={labelStyle}>{label}</div>
      {children}
    </div>
  );
}

/* ---------- styles ---------- */

const page = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "radial-gradient(circle at top, #200000, #000)"
};

const card = {
  width: 420,
  padding: 36,
  borderRadius: 14,
  background: "linear-gradient(145deg, #140000, #2a0000)",
  border: "1px solid #ff4d00",
  boxShadow: "0 0 60px rgba(255,77,0,0.2)"
};

const logo = {
  fontSize: 36,
  fontWeight: 800,
  color: "#fff",
  textAlign: "center",
  marginBottom: 6
};

const subtitle = {
  textAlign: "center",
  fontSize: 12,
  color: "#aaa",
  letterSpacing: 2,
  marginBottom: 28
};

const labelStyle = {
  color: "#ff4d00",
  fontSize: 11,
  letterSpacing: 1,
  marginBottom: 6
};

const cta = {
  width: "100%",
  padding: 14,
  marginTop: 10,
  background: "#ff4d00",
  border: "none",
  borderRadius: 8,
  fontWeight: 800,
  cursor: "pointer"
};
