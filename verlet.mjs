import { subVec, dist, mulVec, combine2 } from './misc.mjs';

export class VerletObject {
    constructor(pos = [0, 0], accel = [0, 0]) {
        this.pos = Array.from(pos);
        this.accel = Array.from(accel);
        this.posPrev = Array.from(pos);
    }

    updatePosition(dt) {
        const vel = subVec(this.pos, this.posPrev)

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

export class Solver {
    constructor(gravity = [0, 1000]) {
        this.g = Array.from(gravity);
        this.objects = [];
    }

    addObject(o) {
        this.objects.push(o);
    }

    update(dt) {
        const subSteps = 8; // 1, 2, 4, 8
        const subDt = dt / subSteps;

        for (let i = 0; i < subSteps; ++i) {
            this.applyGravity();
            this.applyConstraint();
            this.solveCollisions();
            this.updatePositions(subDt);
        }
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
            const toO = subVec(o.pos, pos);
            const di = dist(toO, [0, 0]);
            if (di > r - o.r) {
                const versor = mulVec(1 / di, toO);
                o.pos[0] = pos[0] + versor[0] * (r - o.r);
                o.pos[1] = pos[1] + versor[1] * (r - o.r);
            }
        }
    }

    solveCollisions() {
        for (const [i, j] of combine2(this.objects.length)) {
            const o = this.objects[i];
            const O = this.objects[j];

            const collAxis = subVec(o.pos, O.pos);
            const di = dist(collAxis, [0, 0]);
            const minDist = o.r + O.r;

            if (di < minDist) {
                const versor = mulVec(1/di, collAxis);
                const delta = minDist - di;

                o.pos[0] += 0.5 * delta * versor[0];
                o.pos[1] += 0.5 * delta * versor[1];

                O.pos[0] -= 0.5 * delta * versor[0];
                O.pos[1] -= 0.5 * delta * versor[1];
            }
        }
    }
}
