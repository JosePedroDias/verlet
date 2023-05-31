export class VerletObject {
    constructor(pos = [0, 0], accel = [0, 0]) {
        this.pos = Array.from(pos);
        this.accel = Array.from(accel);
        this.posPrev = Array.from(pos);
    }

    updatePosition(dt) {
        const vel = [
            this.pos[0] - this.posPrev[0],
            this.pos[1] - this.posPrev[1]
        ];

        // save current position
        this.posPrev[0] = this.pos[0];
        this.posPrev[1] = this.pos[1];

        // perform Verlet integration
        this.pos[0] = this.pos[0] + vel[0] + this.accel[0] * dt * dt;
        this.pos[1] = this.pos[1] + vel[1] + this.accel[1] * dt * dt;

        // reset acceleration
        this.accel[0] = 0;
        this.accel[1] = 0;
    }

    accelerate(accel) {
        this.accel[0] += accel[0];
        this.accel[1] += accel[1];
    }
}

function dist([x, y], [z, w]) {
    const dx = x - z;
    const dy = y - w;
    return Math.sqrt(dx * dx + dy * dy);
}

function distSquared([x, y], [z, w]) {
    const dx = x - z;
    const dy = y - w;
    return dx * dx + dy * dy;
}

function mulVec(scalar, [x, y]) {
    return [
        scalar * x,
        scalar * y
    ];
}

export class Solver {
    constructor(gravity = [0, 1000]) {
        this.g = Array.from(gravity);
        this.objects = [];
    }

    addObject(o) {
        this.objects.push(o);
    }

    update(dt) {
        this.applyGravity();
        this.applyConstraint();
        this.updatePositions(dt);
    }

    updatePositions(dt) {
        for (const o of this.objects) {
            o.updatePosition(dt);
        }
    }

    applyGravity() {
        for (const o of this.objects) {
            o.accelerate(this.g);
        }
    }

    applyConstraint() {
        const pos = [400, 300];
        const r = 300;
        for (const o of this.objects) {
            const toO = [
                o.pos[0] - pos[0],
                o.pos[1] - pos[1]
            ];
            const di = dist(toO, [0, 0]);
            if (di > r - o.r) {
                const versor = mulVec(1 / di, toO);
                o.pos[0] = pos[0] + versor[0] * (r - o.r);
                o.pos[1] = pos[1] + versor[1] * (r - o.r);
            }
        }
    }
}
