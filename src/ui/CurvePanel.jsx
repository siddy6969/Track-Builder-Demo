import { getValidCurveTypes, getSpeedLabel, getTurnTypeLabel } from "../utils/turnClassification.js";

export default function CurvePanel({
  turn,
  selectedType,
  onTypeSelect,
  onSave,
  onCancel,
  onBack,
  onNext
}) {
  const activeType = turn?.type ?? selectedType;
  const validTypes = turn ? getValidCurveTypes(turn.angle) : [];
  const speedLabel = turn ? getSpeedLabel(turn.angle) : "";
  const turnTypeLabel = turn ? getTurnTypeLabel(turn.angle) : "";

  return (
    <aside style={sidebarStyle}>
      <h1 style={title}>Curve Editor</h1>

      {!turn && (
        <p style={muted}>Click a node on the track to edit its curve</p>
      )}

      {turn && (
        <>
          <div style={infoSection}>
            <p style={infoLabel}>Editing segment → node {turn.clickedNodeIndex != null ? turn.clickedNodeIndex + 1 : "?"}</p>
            <div style={infoRow}>
              <span style={infoBadge}>{turn.angle}°</span>
              <span style={infoBadge}>{turnTypeLabel}</span>
              <span style={{...infoBadge, ...speedBadge[speedLabel.toLowerCase()]}}>{speedLabel}</span>
            </div>
          </div>

          <div style={optionsContainer}>
          {validTypes.map((o) => (
            <button
              key={o}
              style={{
                ...optionButton,
                background: activeType === o ? "#ff4d00" : "#2a2a2a",
                borderColor: activeType === o ? "#ff4d00" : "#2a2a2a"
              }}
              onClick={() => onTypeSelect(o)}
            >
              {o}
            </button>
          ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button style={primaryButton} onClick={onSave}>
              Save
            </button>
            <button style={secondaryButton} onClick={onCancel}>
              Cancel
            </button>
          </div>
        </>
      )}

      <div style={navRow}>
        <button style={navButton} onClick={onBack}>
          ← Back
        </button>
        <button style={{ ...navButton, ...primaryNavButton }} onClick={onNext}>
          Next: Preview →
        </button>
      </div>
    </aside>
  );
}

const infoSection = { marginBottom: 16 };
const infoLabel = { color: "#aaa", fontSize: 12, marginBottom: 8 };
const infoRow = { display: "flex", gap: 8, flexWrap: "wrap" };
const infoBadge = {
  padding: "4px 10px",
  background: "#2a2a2a",
  borderRadius: 4,
  fontSize: 11,
  fontWeight: 600,
  color: "#fff"
};
const speedBadge = {
  slow: { background: "#ff3b30", color: "#fff" },
  medium: { background: "#ffa500", color: "#000" },
  fast: { background: "#0f0", color: "#000" }
};

/* styles */

const sidebarStyle = {
  width: 320,
  background: "#1c1c1c",
  padding: 24,
  borderRight: "1px solid #2a2a2a"
};

const title = { fontSize: 22, marginBottom: 12 };
const muted = { color: "#9a9a9a", fontSize: 13 };
const optionsContainer = { maxHeight: 280, overflowY: "auto", marginTop: 8 };

const optionButton = {
  width: "100%",
  padding: 10,
  border: "1px solid #2a2a2a",
  borderRadius: 6,
  color: "#fff",
  marginBottom: 8,
  cursor: "pointer"
};

const primaryButton = {
  flex: 1,
  padding: 10,
  background: "#ff3b30",
  border: "none",
  borderRadius: 6,
  color: "#fff",
  fontWeight: 600
};

const secondaryButton = {
  flex: 1,
  padding: 10,
  background: "#2a2a2a",
  border: "none",
  borderRadius: 6,
  color: "#fff"
};

const navRow = {
  display: "flex",
  gap: 12,
  marginTop: 32,
  paddingTop: 24,
  borderTop: "1px solid #2a2a2a"
};

const navButton = {
  flex: 1,
  padding: "10px 16px",
  background: "#2a2a2a",
  border: "1px solid #444",
  borderRadius: 6,
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer"
};

const primaryNavButton = {
  background: "#ff4d00",
  borderColor: "#ff4d00"
};
