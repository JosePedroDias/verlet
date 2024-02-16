import { Canvas, Circle } from './canvas.mjs';
import { FixedConstraint, LinearForce, LinkConstraint, Solver } from './verlet.mjs';
import { addVec, mulVec, pairs } from './misc.mjs';

// chain with 1 pinned end
export function setup() {
    const W = 800;
    const H = 3/4 * W;

    const cv = new Canvas([W, H]);
    const sv = new Solver(8);

    const numEntities = 8;
    const p0 = [W * 0.5, H * 0.2];
    const dp = [W * 0.04, 0];
    const r = W * 0.015;

    const entities = [];

    for (let i = 0; i < numEntities; ++i) {
        const dpp = mulVec(i, dp);
        const pos = addVec(p0, dpp);
        const c = new Circle(pos, r, i % 2 === 0 ? 'blue' : 'cyan');
        entities.push(c);
    }

    const lf = new LinearForce([0, 98], entities);
    sv.addForce(lf);

    for (const o of entities) {
        cv.addObject(o);
        sv.addObject(o);
    }

    sv.addConstraint( new FixedConstraint(entities[0].pos, [entities[0]]) );

    const td = entities[1].pos[0] - entities[0].pos[0];
    for (const [i, j] of pairs(entities.length)) {
        sv.addConstraint( new LinkConstraint(entities[i], entities[j], td) );
    }

    return { sv, cv };
}
