/**
 * Go-kart physics and simulation
 * Realistic kart behavior with different configurations
 */

/**
 * Preconfigured kart types
 */
export const KART_PRESETS = {
    beginner: {
        name: "Beginner Kart",
        description: "Easy to drive, forgiving handling",
        maxSpeed: 45,           // km/h
        acceleration: 3.5,      // m/s²
        braking: 6.0,           // m/s²
        handling: 0.85,         // 0-1, higher = more responsive
        grip: 0.9,              // 0-1, higher = more grip
        weight: 180,            // kg (kart + driver)
        power: 6.5,             // HP
        color: "#4CAF50"        // Green
    },

    intermediate: {
        name: "Intermediate Kart",
        description: "Balanced performance",
        maxSpeed: 65,
        acceleration: 5.0,
        braking: 8.0,
        handling: 0.75,
        grip: 0.8,
        weight: 165,
        power: 13,
        color: "#2196F3"        // Blue
    },

    advanced: {
        name: "Advanced Kart",
        description: "High performance, requires skill",
        maxSpeed: 85,
        acceleration: 6.5,
        braking: 10.0,
        handling: 0.65,
        grip: 0.75,
        weight: 150,
        power: 20,
        color: "#FF4D00"        // Orange
    },

    racing: {
        name: "Racing Kart",
        description: "Maximum performance, very challenging",
        maxSpeed: 110,
        acceleration: 8.0,
        braking: 12.0,
        handling: 0.55,
        grip: 0.7,
        weight: 140,
        power: 30,
        color: "#F44336"        // Red
    },

    drift: {
        name: "Drift Kart",
        description: "Low grip, high speed, drift-focused",
        maxSpeed: 95,
        acceleration: 7.0,
        braking: 9.0,
        handling: 0.6,
        grip: 0.5,              // Low grip for drifting
        weight: 155,
        power: 25,
        color: "#9C27B0"        // Purple
    }
};

/**
 * Kart state and physics
 */
/**
 * Kart state and physics
 */
export class Kart {
    constructor(preset = 'intermediate', startPosition = { x: 0, y: 0 }, startAngle = 0) {
        const config = KART_PRESETS[preset] || KART_PRESETS.intermediate;

        // Kart configuration
        this.config = { ...config };
        this.preset = preset;

        // Position and orientation
        this.x = startPosition.x;
        this.y = startPosition.y;
        this.angle = startAngle; // radians

        // Velocity
        this.speed = 0;          // m/s
        this.vx = 0;             // velocity x component
        this.vy = 0;             // velocity y component

        // Input state
        this.throttle = 0;       // 0-1
        this.brake = 0;          // 0-1
        this.steering = 0;       // -1 to 1 (left to right)

        // Physics state
        this.drifting = false;
        this.driftAngle = 0;
        this.traction = 1.0;
        this.maxLateralG = this.config.grip * 2.5 * 9.8; // ~2.5G max cornering depending on grip

        // Lap tracking
        this.currentLap = 0;
        this.lapTimes = [];
        this.bestLapTime = null;
        this.currentLapStartTime = null;
        this.checkpointsPassed = new Set();
    }

    /**
     * Update kart physics
     * @param {number} dt - Delta time in seconds
     * @param {object} track - Track data for collision detection
     */
    update(dt, track = null) {
        // Convert max speed from km/h to m/s
        const maxSpeedMS = (this.config.maxSpeed * 1000) / 3600;

        // Apply throttle (acceleration)
        if (this.throttle > 0) {
            const accel = this.config.acceleration * this.throttle;
            this.speed += accel * dt;
            this.speed = Math.min(this.speed, maxSpeedMS);
        }

        // Apply braking
        if (this.brake > 0) {
            const brakeForce = this.config.braking * this.brake;
            this.speed -= brakeForce * dt;
            this.speed = Math.max(this.speed, 0);
        }

        // Natural deceleration (friction/drag)
        if (this.throttle === 0 && this.brake === 0) {
            const friction = 2.0; // m/s²
            this.speed -= friction * dt;
            this.speed = Math.max(this.speed, 0);
        }

        // CALCULATE TURNING
        if (this.speed > 0.1) {
            // Requested turning rate based on steering input
            // Steering effectiveness decreases slightly at very high speeds
            const speedFactor = Math.min(1.0, 30 / this.speed);
            const requestedTurnRate = this.steering * this.config.handling * speedFactor * 4.0; // rad/s

            // Calculate lateral G-force required for this turn: a = v * omega
            const lateralAccel = Math.abs(this.speed * requestedTurnRate);

            // Check if we exceed traction limits
            let actualTurnRate = requestedTurnRate;

            if (lateralAccel > this.maxLateralG) {
                // Grip limit exceeded!
                this.drifting = true;
                this.traction = 0.6; // Loss of traction

                // Limit turn rate based on available grip
                const maxRate = this.maxLateralG / this.speed;
                actualTurnRate = Math.sign(requestedTurnRate) * maxRate;

                // Visual drift angle (difference between facing and movement)
                this.driftAngle = (requestedTurnRate - actualTurnRate) * 0.5;

                // Scrub speed when drifting/sliding
                this.speed -= 5.0 * dt;
            } else {
                this.drifting = false;
                this.driftAngle *= 0.9;
                this.traction = 1.0;
            }

            this.angle += actualTurnRate * dt;
        }

        // Update velocity components (movement vector is separate from facing angle during drift)
        const movementAngle = this.angle + (this.drifting ? this.driftAngle : 0);
        this.vx = Math.cos(movementAngle) * this.speed;
        this.vy = Math.sin(movementAngle) * this.speed;

        // Update position
        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Track collision (if track data provided)
        if (track) {
            this.handleTrackCollision(track);
        }
    }

    /**
     * Handle collision with track boundaries
     */
    handleTrackCollision(track) {
        // Simplified collision: check if kart is on track
        const onTrack = this.isOnTrack(track);
        if (!onTrack) {
            this.speed *= 0.95; // Lose speed off-track
            this.traction *= 0.7; // Reduced traction
        }
    }

    /**
     * Check if kart is on the track
     */
    isOnTrack(track) {
        return true; // Placeholder
    }

    /**
     * Set input controls
     */
    setControls(throttle, brake, steering) {
        this.throttle = Math.max(0, Math.min(1, throttle));
        this.brake = Math.max(0, Math.min(1, brake));
        this.steering = Math.max(-1, Math.min(1, steering));
    }

    /**
     * Get current speed in km/h
     */
    getSpeedKMH() {
        return (this.speed * 3600) / 1000;
    }

    /**
     * Reset kart to starting position
     */
    reset(startPosition, startAngle) {
        this.x = startPosition.x;
        this.y = startPosition.y;
        this.angle = startAngle;
        this.speed = 0;
        this.vx = 0;
        this.vy = 0;
        this.throttle = 0;
        this.brake = 0;
        this.steering = 0;
        this.drifting = false;
        this.driftAngle = 0;
        this.traction = 1.0;
    }

    /**
     * Start a new lap
     */
    startLap() {
        this.currentLapStartTime = Date.now();
        this.checkpointsPassed.clear();
    }

    /**
     * Finish current lap
     */
    finishLap() {
        if (this.currentLapStartTime) {
            const lapTime = Date.now() - this.currentLapStartTime;
            this.lapTimes.push(lapTime);

            if (!this.bestLapTime || lapTime < this.bestLapTime) {
                this.bestLapTime = lapTime;
            }

            this.currentLap++;
            this.currentLapStartTime = null;
        }
    }

    /**
     * Get formatted lap time
     */
    getFormattedLapTime(timeMs) {
        const minutes = Math.floor(timeMs / 60000);
        const seconds = Math.floor((timeMs % 60000) / 1000);
        const ms = Math.floor((timeMs % 1000) / 10);
        return `${minutes}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    }
}

/**
 * AI Kart controller (follows optimal racing line)
 */
export class AIKart extends Kart {
    constructor(preset, startPosition, startAngle, racingLine) {
        super(preset, startPosition, startAngle);
        this.racingLine = racingLine; // Array of {x, y} points
        this.targetIndex = 0;
        this.lookaheadDistance = 40; // meters
    }

    /**
     * Update AI controls based on racing line
     */
    updateAI(dt, track) {
        if (!this.racingLine || this.racingLine.length === 0) {
            this.setControls(0.5, 0, 0);
            return;
        }

        // Find target point on racing line
        const target = this.findTargetPoint();

        // Calculate distance to target
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const dist = Math.hypot(dx, dy);

        // Steering
        const targetAngle = Math.atan2(dy, dx);
        let angleDiff = targetAngle - this.angle;

        // Normalize angle difference to [-π, π]
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // Set steering (-1 to 1) with slight smoothing
        const steering = Math.max(-1, Math.min(1, angleDiff * 2.5));

        // ==== INTELLIGENT BRAKING ====
        // Calculate corner sharpness ahead
        // We look at the angle between current vector and vector 3 points ahead
        const nextIdx = (this.targetIndex + 3) % this.racingLine.length;
        const nextPt = this.racingLine[nextIdx];
        const vectorX = nextPt.x - target.x;
        const vectorY = nextPt.y - target.y;
        const nextAngle = Math.atan2(vectorY, vectorX);
        let turnAngle = Math.abs(nextAngle - targetAngle);
        while (turnAngle > Math.PI) turnAngle -= 2 * Math.PI;
        turnAngle = Math.abs(turnAngle);

        // Estimate max safe speed for this turn
        // Approximating radius R = segment_length / turn_angle
        // v_max = sqrt(grip * g * R)
        // Simplify: The sharper the turnAngle, the slower we must be.

        let speedLimit = this.config.maxSpeed; // Default max speed

        if (turnAngle > 0.1) { // If there is a turn coming up
            // Heuristic speed limit based on turn sharpness
            // Sharp hairpin (turnAngle ~ 1.5 rad) -> speed limit ~ 30 km/h (8 m/s)
            // Shallow turn (turnAngle ~ 0.3 rad) -> speed limit ~ 80 km/h (22 m/s)
            // Formula: v = Base / turnAngle
            speedLimit = 25 / Math.max(0.2, turnAngle); // Empirical constant
        }

        // Current speed
        const currentSpeedKMH = this.getSpeedKMH();

        let throttle = 0;
        let brake = 0;

        if (currentSpeedKMH < speedLimit) {
            throttle = 1.0;
            brake = 0;
        } else {
            throttle = 0;
            brake = Math.min(1.0, (currentSpeedKMH - speedLimit) * 0.1); // Proportional braking
        }

        // Corner exit acceleration
        if (Math.abs(angleDiff) < 0.2 && turnAngle < 0.2) {
            throttle = 1.0;
            brake = 0;
        }

        this.setControls(throttle, brake, steering);
        this.update(dt, track);
    }

    /**
     * Find target point on racing line
     */
    findTargetPoint() {
        // Find closest point on racing line to start search
        let closestDist = Infinity;
        let closestIndex = this.targetIndex;

        // Scan locally (don't scan whole track every frame)
        const scanRange = 20;
        for (let i = 0; i < scanRange; i++) {
            const idx = (this.targetIndex + i) % this.racingLine.length;
            const point = this.racingLine[idx];
            const dist = Math.hypot(point.x - this.x, point.y - this.y);

            // We want the point we are approaching, not one behind us
            // But for simplicity, closest point is usually best anchor
            if (dist < closestDist) {
                closestDist = dist;
                closestIndex = idx;
            }
        }

        // Look ahead on the racing line
        // Lookahead increases with speed to prevent oscillation
        const dynamicLookahead = this.lookaheadDistance + (this.speed * 0.5);

        // Tuned for dense points (approx 1m spacing with 10 pts/segment)
        const spacingEstimate = 1;
        const lookaheadPoints = Math.max(5, Math.floor(dynamicLookahead / spacingEstimate));

        this.targetIndex = (closestIndex + lookaheadPoints) % this.racingLine.length;

        return this.racingLine[this.targetIndex];
    }
}
