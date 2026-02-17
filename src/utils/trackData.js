import { trackState } from "../state/trackState.js";

/**
 * Export track data as JSON
 */
export function exportTrackJSON() {
    const data = {
        version: "1.0",
        grid: { ...trackState.grid },
        trackWidth: trackState.trackWidth,
        closed: trackState.closed,
        nodes: trackState.nodes.map((n) => ({ x: n.x, y: n.y })),
        turns: Object.entries(trackState.turns).reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
        }, {})
    };

    return JSON.stringify(data, null, 2);
}

/**
 * Import track data from JSON
 */
export function importTrackJSON(jsonString) {
    try {
        const data = JSON.parse(jsonString);

        trackState.grid = { ...data.grid };
        trackState.trackWidth = data.trackWidth ?? 8;
        trackState.closed = data.closed ?? false;
        trackState.nodes = data.nodes.map((n) => ({ x: n.x, y: n.y }));
        trackState.turns = data.turns ?? {};
        trackState.previewCurve = null;
        trackState.editingNodeIndex = null;

        return true;
    } catch (error) {
        console.error("Failed to import track:", error);
        return false;
    }
}
