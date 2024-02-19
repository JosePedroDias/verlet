import { subVec, dist, mulVec, combine2, addVec } from './misc.mjs';

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
    constructor(
        subSteps = 1,
        onCollisionFn = undefined,
        requiresCollisionFn = undefined
    ) {
        this.subSteps = subSteps;
        this.onCollisionFn = onCollisionFn;
        this.requiresCollisionFn = requiresCollisionFn;

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

    removeConstraint(c) {
        const idx = this.constraints.indexOf(c);
        if (idx === -1) return;
        //console.log('removing constraint', idx, 'out of', this.constraints.length);
        this.constraints.splice(idx, 1);
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
        const totalObjects = this.objects.length;
        let computedCollisions = 0;

        for (const [i, j] of combine2(totalObjects)) {
            const o = this.objects[i];
            const O = this.objects[j];

            if (this.requiresCollisionFn && !this.requiresCollisionFn(o, O)) continue;
            ++computedCollisions;

            const collAxis = subVec(o.pos, O.pos);
            const di = dist(collAxis);
            const minDist = o.r + O.r;

            if (di < minDist) {
                this.onCollisionFn && this.onCollisionFn(o, O);

                const versor = mulVec(1/di, collAxis);
                const delta = minDist - di;

                o.pos[0] += 0.5 * delta * versor[0];
                o.pos[1] += 0.5 * delta * versor[1];

                O.pos[0] -= 0.5 * delta * versor[0];
                O.pos[1] -= 0.5 * delta * versor[1];
            }
        }

        //console.log(computedCollisions, totalObjects);
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
    constructor(center = [0, 0], objects = [], dontCopy = false) {
        this.center = dontCopy ? center : Array.from(center); //we want to be able to keep the instance instead of copying
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
            const di = dist(toO);
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

export class RectangularConstraint {
    constructor(center = [0, 0], dims = [100, 100], objects = []) {
        this.center = Array.from(center);
        this.halfDims = Array.from(dims).map(v => v/2);
        this.objects = Array.from(objects);
    }

    apply_() {
        const pos = this.center;
        const hDims = this.halfDims;

        for (const o of this.objects) {
            const oPos = o.pos;

            let x0 = pos[0] - hDims[0] + o.r;
            let x1 = pos[0] + hDims[0] - o.r;
            let y0 = pos[1] - hDims[1] + o.r;
            let y1 = pos[1] + hDims[1] - o.r;

            // stops axis movement
            if      (oPos[0] < x0) oPos[0] = x0;
            else if (oPos[0] > x1) oPos[0] = x1;

            if      (oPos[1] < y0) oPos[1] = y0;
            else if (oPos[1] > y1) oPos[1] = y1;

            /* const fact = 1;
            //const fact = dist(o.vel);

            if      (oPos[0] < x0) oPos[0] += fact * (x0 - oPos[0]);
            else if (oPos[0] > x1) oPos[0] += fact * (x1 - oPos[0]);

            if      (oPos[1] < y0) oPos[1] += fact * (y0 - oPos[1]);
            else if (oPos[1] > y1) oPos[1] += fact * (y1 - oPos[1]); */
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
        const di = dist(axis);
        const versor = mulVec(1 / di, axis);
        const delta = this.targetDi - di;

        this.o.pos[0] += 0.5 * delta * versor[0];
        this.o.pos[1] += 0.5 * delta * versor[1];

        this.O.pos[0] -= 0.5 * delta * versor[0];
        this.O.pos[1] -= 0.5 * delta * versor[1];
    }
}
