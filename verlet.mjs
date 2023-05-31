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
    constructor(subSteps = 1) {
        this.subSteps = subSteps;
        this.forces = [];
        this.constraints = [];
        this.objects = [];
    }

    addForce(f) {
        this.forces.push(f);
    }

    addConstraint(c) {
        this.constraints.push(c);
    }

    addObject(o) {
        this.objects.push(o);
    }

    update(dt) {
        const subDt = dt / this.subSteps;

        for (let i = 0; i < this.subSteps; ++i) {
            this.applyForces();
            this.applyConstraints();
            this.solveCollisions();
            this.updatePositions(subDt);
        }
    }

    updatePositions(dt) {
        for (const o of this.objects) {
            o.updatePosition(dt);
        }
    }

    applyForces() {
        for (const f of this.forces) {
            f.apply_();
        }
    }

    applyConstraints() {
        for (const c of this.constraints) {
            c.apply_();
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

export class LinearForce {
    constructor(g = [0, 0], objects = []) {
        this.g = Array.from(g);
        this.objects = Array.from(objects);
    }

    apply_() {
        for (const o of this.objects) {
            o.accelerate(this.g);
        }
    }

    addObject(o) {
        this.objects.push(o);
    }
}

export class FixedConstraint {
    constructor(center = [0, 0], objects = []) {
        this.center = Array.from(center);
        this.objects = Array.from(objects);
    }

    apply_() {
        for (const o of this.objects) {
            o.pos[0] = this.center[0];
            o.pos[1] = this.center[1];
        }
    }
}
export class CircularConstraint {
    constructor(center = [0, 0], r = 100, objects = []) {
        this.center = Array.from(center);
        this.r = r;
        this.objects = Array.from(objects);
    }

    apply_() {
        const pos = this.center;
        const r = this.r;
        for (const o of this.objects) {
            const toO = subVec(o.pos, pos);
            const di = dist(toO, [0, 0]);
            if (di !== 0 && di > r - o.r) {
                const versor = mulVec(1 / di, toO);
                o.pos[0] = pos[0] + versor[0] * (r - o.r);
                o.pos[1] = pos[1] + versor[1] * (r - o.r);
            }
        }
    }

    addObject(o) {
        this.objects.push(o);
    }
}

export class LinkConstraint {
    constructor(o, O, targetDi) {
        this.o = o;
        this.O = O;
        this.targetDi = targetDi;
    }

    apply_() {
        const axis = subVec(this.o.pos, this.O.pos);
        const di = dist(axis, [0, 0]);
        const versor = mulVec(1 / di, axis);
        const delta = this.targetDi - di;

        this.o.pos[0] += 0.5 * delta * versor[0];
        this.o.pos[1] += 0.5 * delta * versor[1];

        this.O.pos[0] -= 0.5 * delta * versor[0];
        this.O.pos[1] -= 0.5 * delta * versor[1];
    }
}
