
/**
 * PhysicsSolver.js
 * Analytical solver for optimal lap time calculation based on racing line geometry and kart physics.
 */

// Physics Constants
const GRAVITY = 9.81;
const AIR_DENSITY = 1.225;

export const KART_PHYSICS = {
    racing: {
        id: 'racing',
        name: 'Racing Kart',
        description: 'Standard competition kart',
        color: '#ff4d00',
        mass: 145, // kg
        power: 28000, // Watts (approx 38 HP)
        gripInG: 2.2, // G-force grip
        dragArea: 0.45, // Cd * A
        brakeG: 1.8, // Braking G-force
        maxSpeed: 140 / 3.6 // m/s
    },
    intermediate: {
        id: 'intermediate',
        name: 'Intermediate Kart',
        description: 'Good for learning tracks',
        color: '#4CAF50',
        mass: 160,
        power: 15000, // Approx 20 HP
        gripInG: 1.6,
        dragArea: 0.50,
        brakeG: 1.5,
        maxSpeed: 110 / 3.6
    },
    drift: {
        id: 'drift',
        name: 'Drift Kart',
        description: 'Loose handling for sliding',
        color: '#FF9800',
        mass: 150,
        power: 20000,
        gripInG: 1.2, // LOW grip
        dragArea: 0.55,
        brakeG: 1.4,
        maxSpeed: 120 / 3.6
    },
    advanced: {
        id: 'advanced',
        name: 'Formula Kart',
        description: 'Maximum grip and power',
        color: '#2196F3',
        mass: 150,
        power: 35000, // 47 HP
        gripInG: 2.8,
        dragArea: 0.40,
        brakeG: 2.2,
        maxSpeed: 160 / 3.6
    }
};

/**
 * Calculates the optimal velocity profile and lap time for a given path.
 * 
 * @param {Array} path - Array of {x, y} points
 * @param {Object|string} kartConfigOrName - Kart physics parameters object OR preset name
 * @returns {Object} result
 */
export function calculateOptimalLapTime(path, kartConfigOrName = 'racing') {
    if (!path || path.length < 3) return null;

    // Resolve config
    let config;
    if (typeof kartConfigOrName === 'string') {
        config = KART_PHYSICS[kartConfigOrName] || KART_PHYSICS.racing;
    } else {
        config = { ...KART_PHYSICS.racing, ...kartConfigOrName };
    }

    const n = path.length;

    // 1. Calculate Geometry (Distances and Curvature)
    const dists = new Float32Array(n); // Distance to NEXT point
    const curvature = new Float32Array(n); // 1/radius
    const maxCornerSpeed = new Float32Array(n);

    // Total length
    let totalLength = 0;

    for (let i = 0; i < n; i++) {
        const p0 = path[(i - 1 + n) % n];
        const p1 = path[i];
        const p2 = path[(i + 1) % n];

        // Distance p1 -> p2
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const d = Math.hypot(dx, dy);
        dists[i] = d;
        totalLength += d;

        // Curvature (Menger curvature)
        // Area of triangle p0, p1, p2 = 0.5 |x1(y2-y3) + x2(y3-y1) + x3(y1-y2)|
        const area = 0.5 * Math.abs(p0.x * (p1.y - p2.y) + p1.x * (p2.y - p0.y) + p2.x * (p0.y - p1.y));
        const d01 = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        const d12 = d;
        const d20 = Math.hypot(p0.x - p2.x, p0.y - p2.y);

        // R = (a*b*c) / (4 * area)
        // k = 1/R = (4 * area) / (a*b*c)
        if (area < 0.001) {
            curvature[i] = 0; // Straight line
            maxCornerSpeed[i] = config.maxSpeed;
        } else {
            const k = (4 * area) / (d01 * d12 * d20);
            curvature[i] = k;

            // V_max = sqrt( acc_lat / k )
            // acc_lat = grip * g
            const vMax = Math.sqrt((config.gripInG * GRAVITY) / k);
            maxCornerSpeed[i] = Math.min(config.maxSpeed, vMax);
        }
    }

    // 2. Velocity Profile Initialization
    const velocities = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        velocities[i] = maxCornerSpeed[i];
    }

    // 3. Backward Pass (Braking Limit)
    // Constraint: V[i] <= sqrt( V[i+1]^2 + 2 * a_brake * d )
    // We iterate backwards multiple times to handle the loop closure properly

    // Determine max braking deceleration (const for simplification, or detailed?)
    // a_brake = brakeG * g + drag
    // We use a simplified conservative braking model
    const maxBrakeDecel = config.brakeG * GRAVITY;

    // Backwards loop (do 2 passes for closed loop convergence)
    for (let pass = 0; pass < 2; pass++) {
        for (let i = n - 1; i >= 0; i--) {
            const nextIdx = (i + 1) % n;
            const d = dists[i]; // dist from i to next

            const vNext = velocities[nextIdx];

            // Max entry speed at i allowed by braking capability
            // v_i = sqrt( v_next^2 + 2 * a * d )
            // Add drag? Drag HELPS braking.
            // approx: v_i^2 = v_next^2 + 2 * (brakeG * g) * d
            // This is conservative (ignores air drag helping).

            const maxEntrySq = (vNext * vNext) + (2 * maxBrakeDecel * d);
            const maxEntry = Math.sqrt(maxEntrySq);

            velocities[i] = Math.min(velocities[i], maxEntry);
        }
    }

    // 4. Forward Pass (Acceleration Limit)
    // Constraint: V[i+1] <= sqrt( V[i]^2 + 2 * a_acc * d )
    // Acceleration depends on current speed (Power limited)

    for (let pass = 0; pass < 2; pass++) {
        for (let i = 0; i < n; i++) {
            const nextIdx = (i + 1) % n;
            const d = dists[i];
            const vCurr = velocities[i];

            // Calculate effective acceleration at this speed
            // Force_tires = Power / v
            // Force_drag = 0.5 * rho * CdA * v^2
            // F_net = F_tires - F_drag
            // a = F_net / m

            // Avoid division by zero
            const vSafe = Math.max(1, vCurr);
            const fTraction = Math.min(config.mass * config.gripInG * GRAVITY, config.power / vSafe);
            const fDrag = 0.5 * AIR_DENSITY * config.dragArea * vSafe * vSafe;
            const fNet = fTraction - fDrag;
            const accel = Math.max(0, fNet / config.mass);

            // v_next = sqrt( v_curr^2 + 2 * a * d )
            const maxNextSq = (vCurr * vCurr) + (2 * accel * d);
            const maxNext = Math.sqrt(maxNextSq);

            velocities[nextIdx] = Math.min(velocities[nextIdx], maxNext);
        }
    }

    // 5. Calculate Time
    let totalTime = 0;
    let maxV = 0;
    let minV = Infinity;
    let sumV = 0;

    for (let i = 0; i < n; i++) {
        const d = dists[i];
        const v = velocities[i];
        const nextV = velocities[(i + 1) % n];
        const avgV = (v + nextV) * 0.5;

        if (avgV > 0.1) {
            totalTime += d / avgV;
        }

        if (v > maxV) maxV = v;
        if (v < minV) minV = v;
        sumV += v;
    }

    return {
        lapTime: totalTime,
        lapTimeFormatted: formatTime(totalTime * 1000),
        maxSpeed: (maxV * 3.6).toFixed(0),
        minSpeed: (minV * 3.6).toFixed(0),
        avgSpeed: ((sumV / n) * 3.6).toFixed(0),
        totalLength: totalLength.toFixed(0)
    };
}

function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
}
