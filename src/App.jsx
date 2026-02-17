import { useState } from "react";
import ConfigPage from "./pages/ConfigPage.jsx";
import NodeEditorPage from "./pages/NodeEditorPage.jsx";
import CurveEditorPage from "./pages/CurveEditorPage.jsx";
import PreviewPage from "./pages/PreviewPage.jsx";
import SimulationPage from "./pages/SimulationPage.jsx";

export default function App() {
  const [step, setStep] = useState("config");

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#0b0b0b",
        fontFamily: "Inter, system-ui, sans-serif"
      }}
    >
      {step === "config" && (
        <ConfigPage
          onNext={() => setStep("nodes")}
        />
      )}

      {step === "nodes" && (
        <NodeEditorPage
          onBack={() => setStep("config")}
          onNext={() => setStep("curves")}
        />
      )}

      {step === "curves" && (
        <CurveEditorPage
          onBack={() => setStep("nodes")}
          onNext={() => setStep("preview")}
        />
      )}

      {step === "preview" && (
        <PreviewPage
          onBack={() => setStep("curves")}
          onSimulate={() => setStep("simulation")}
        />
      )}

      {step === "simulation" && (
        <SimulationPage onBack={() => setStep("preview")} />
      )}
    </div>
  );
}

const previewPlaceholder = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 16
};

const navButton = {
  padding: "10px 20px",
  background: "#ff4d00",
  border: "none",
  borderRadius: 8,
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer"
};
