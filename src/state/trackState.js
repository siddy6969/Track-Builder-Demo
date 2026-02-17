export const trackState = {
  grid: {
    rows: 40,
    cols: 60,
    cellSize: 10
  },

  trackWidth: 3,

  nodes: [],

  /** Whether the track forms a closed loop (first node clicked to finish) */
  closed: false,

  turns: {},

  previewTurn: null,

  /** Lives preview: { index, type } when user selects curve before Save */
  previewCurve: null,

  /** Node index whose curve is being edited (for highlight) */
  editingNodeIndex: null,

  // 🔑 MUST exist or renderer crashes
  generatedPath: []
};
