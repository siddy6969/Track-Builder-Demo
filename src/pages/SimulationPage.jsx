import { useState, useEffect, useRef } from "react";
import { trackState } from "../state/trackState.js";
import { getInterpolatedRacingLine } from "../simulation/RacingLineGenerator.js";
import { drawGrid } from "../canvas/GridRenderer.js";
import { drawTrackPreview } from "../canvas/TrackPreviewRenderer.js";
import { calculateOptimalLapTime, KART_PHYSICS } from "../simulation/PhysicsSolver.js";

export default function SimulationPage({ onBack }) {
    const canvasRef = useRef(null);

    // State for Simulation / Calculator
    const [mode, setMode] = useState('preset'); // 'preset' or 'custom'
    const [selectedPreset, setSelectedPreset] = useState('racing');

    // Custom Config State
    const [customConfig, setCustomConfig] = useState({
        mass: 145,
        power: 28000,
        gripInG: 2.2,
        dragArea: 0.45,
        brakeG: 1.8
    });

    const [calculatedStats, setCalculatedStats] = useState(null);
    const racingLineRef = useRef([]);

    // Initialize Racing Line on mount
    useEffect(() => {
        if (trackState.nodes.length > 0) {
            // Generate optimal racing line geometry once
            const racingLine = getInterpolatedRacingLine(
                trackState.nodes,
                trackState.closed && trackState.nodes.length >= 3,
                trackState.trackWidth
            );
            racingLineRef.current = racingLine;

            // Draw initial static frame
            drawStaticFrame();
        }
    }, []);

    const handleCustomChange = (field, value) => {
        setCustomConfig(prev => ({
            ...prev,
            [field]: parseFloat(value)
        }));
    };

    const calculateLap = () => {
        if (!racingLineRef.current || racingLineRef.current.length < 3) return;

        let config;
        if (mode === 'preset') {
            config = KART_PHYSICS[selectedPreset];
        } else {
            // Use custom values
            config = {
                ...customConfig,
                maxSpeed: 200 / 3.6 // Default high max speed for custom
            };
        }

        const result = calculateOptimalLapTime(racingLineRef.current, config);
        setCalculatedStats(result || { error: "Calculation failed" });
    };

    // Static Drawing (No Game Loop)
    const drawStaticFrame = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        // Dark Background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, rect.width, rect.height);

        // Center Track
        const nodes = trackState.nodes;
        if (nodes.length === 0) return;

        // Compute bounds to center camera
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodes.forEach(p => {
            minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
        });

        const contentWidth = maxX - minX + 20; // Padding
        const contentHeight = maxY - minY + 20;
        const scale = Math.min(rect.width / contentWidth, rect.height / contentHeight) * 0.8;
        const cx = (minX + maxX) / 2;
        const cy = (minY + maxY) / 2;

        ctx.save();
        ctx.translate(rect.width / 2, rect.height / 2);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);

        drawGrid(ctx);
        drawGrid(ctx);
        drawTrackPreview(ctx, false, true); // Keep kerbs, but racing line is drawn explicitly below

        // Explicitly draw the optimal racing line
        if (racingLineRef.current && racingLineRef.current.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = '#FF4D00';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]); // Dotted line

            const path = racingLineRef.current;
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x, path[i].y);
            }
            if (trackState.closed) {
                ctx.closePath();
            }
            ctx.stroke();
            ctx.setLineDash([]); // Reset
        }

        ctx.restore();
    };

    // Redraw when resizing
    useEffect(() => {
        window.addEventListener('resize', drawStaticFrame);
        return () => window.removeEventListener('resize', drawStaticFrame);
    }, []);

    if (trackState.nodes.length === 0) {
        return (
            <div style={container}>
                <div style={noTrackMessage}>
                    <h2>No Track Available</h2>
                    <button style={backButton} onClick={onBack}>← Back</button>
                </div>
            </div>
        );
    }

    // UI Helpers
    const renderSlider = (label, field, min, max, step, unit) => (
        <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#aaa', fontSize: 11, marginBottom: 4 }}>
                <span>{label}</span>
                <span style={{ color: '#fff' }}>{customConfig[field]} {unit}</span>
            </div>
            <input
                type="range" min={min} max={max} step={step}
                value={customConfig[field]}
                onChange={(e) => handleCustomChange(field, e.target.value)}
                style={{ width: '100%', accentColor: '#4CAF50' }}
            />
        </div>
    );

    return (
        <div style={container}>
            <aside style={sidebar}>
                <h1 style={title}>Lap Calculator</h1>

                {/* Config Mode Toggle */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    <button
                        style={mode === 'preset' ? activeTab : tab}
                        onClick={() => setMode('preset')}
                    >
                        Presets
                    </button>
                    <button
                        style={mode === 'custom' ? activeTab : tab}
                        onClick={() => setMode('custom')}
                    >
                        Custom Config
                    </button>
                </div>

                {mode === 'preset' ? (
                    <div style={section}>
                        {Object.entries(KART_PHYSICS).map(([key, preset]) => (
                            <button
                                key={key}
                                style={{
                                    ...kartButton,
                                    background: selectedPreset === key ? '#2a2a2a' : 'transparent',
                                    borderColor: selectedPreset === key ? preset.color : '#444',
                                    borderLeft: `4px solid ${preset.color}`
                                }}
                                onClick={() => setSelectedPreset(key)}
                            >
                                <div style={kartButtonTitle}>{preset.name}</div>
                                <div style={kartButtonDesc}>{preset.description}</div>
                                <div style={kartButtonStats}>
                                    <span>{(preset.power / 1000).toFixed(0)}kW</span> •
                                    <span>{preset.gripInG}G</span> •
                                    <span>{preset.mass}kg</span>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div style={section}>
                        {renderSlider("Kart Mass", "mass", 100, 300, 5, "kg")}
                        {renderSlider("Engine Power", "power", 5000, 50000, 500, "W")}
                        {renderSlider("Tire Grip", "gripInG", 0.5, 3.5, 0.1, "G")}
                        {renderSlider("Aerodynamics (CdA)", "dragArea", 0.2, 1.0, 0.05, "")}
                        {renderSlider("Braking Force", "brakeG", 0.5, 3.0, 0.1, "G")}
                    </div>
                )}

                <div style={controls}>
                    <button style={{ ...startButton, width: '100%' }} onClick={calculateLap}>
                        CALCULATE TIME
                    </button>
                </div>

                {calculatedStats && !calculatedStats.error && (
                    <div style={{ marginTop: 24, padding: 16, background: '#1a1a1a', borderRadius: 8, border: '1px solid #333' }}>
                        <div style={{ textAlign: 'center', marginBottom: 16 }}>
                            <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase' }}>Estimated Lap Time</div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: '#4CAF50' }}>
                                {calculatedStats.lapTimeFormatted}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12 }}>
                            <div style={statItem}>
                                <div style={statLabel}>Max Speed</div>
                                <div style={statValue}>{calculatedStats.maxSpeed} <span style={unit}>km/h</span></div>
                            </div>
                            <div style={statItem}>
                                <div style={statLabel}>Avg Speed</div>
                                <div style={statValue}>{calculatedStats.avgSpeed} <span style={unit}>km/h</span></div>
                            </div>
                            <div style={statItem}>
                                <div style={statLabel}>Min Speed</div>
                                <div style={statValue}>{calculatedStats.minSpeed} <span style={unit}>km/h</span></div>
                            </div>
                            <div style={statItem}>
                                <div style={statLabel}>Distance</div>
                                <div style={statValue}>{calculatedStats.totalLength} <span style={unit}>m</span></div>
                            </div>
                        </div>
                    </div>
                )}

                <button style={backButton} onClick={onBack}>← Back to Editor</button>
            </aside>

            <div style={{ flex: 1, position: 'relative', background: '#050505' }}>
                <canvas ref={canvasRef} style={canvas} />
            </div>
        </div>
    );
}

// Styles
const container = { display: 'flex', height: '100%', background: '#0a0a0a' };
const sidebar = { width: 320, background: '#1c1c1c', padding: 24, borderRight: '1px solid #2a2a2a', overflowY: 'auto' };
const title = { fontSize: 22, marginBottom: 24, color: '#fff' };
const section = { marginBottom: 24 };
const kartButton = { width: '100%', padding: 12, marginBottom: 8, border: '1px solid #444', borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' };
const kartButtonTitle = { color: '#fff', fontWeight: 600, marginBottom: 4 };
const kartButtonDesc = { color: '#aaa', fontSize: 11, marginBottom: 8 };
const kartButtonStats = { display: 'flex', gap: 12, fontSize: 10, color: '#666', marginTop: 4 };
const controls = { marginBottom: 24 };
const startButton = { padding: '12px 24px', background: '#4CAF50', border: 'none', borderRadius: 8, color: '#fff', fontSize: 16, fontWeight: 600, cursor: 'pointer' };
const backButton = { marginTop: 24, padding: '10px 16px', background: '#2a2a2a', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer' };
const noTrackMessage = { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#fff', textAlign: 'center', padding: 40 };
const tab = { flex: 1, padding: '8px', background: 'transparent', border: '1px solid #444', color: '#888', cursor: 'pointer', borderRadius: 4 };
const activeTab = { ...tab, background: '#333', color: '#fff', borderColor: '#666' };
const statItem = { background: '#222', padding: 8, borderRadius: 4 };
const statLabel = { color: '#666', marginBottom: 2 };
const statValue = { color: '#fff', fontWeight: 600 };
const unit = { fontSize: 10, color: '#666', fontWeight: 400 };
const canvas = { width: '100%', height: '100%', display: 'block' };
