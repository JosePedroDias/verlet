import { Canvas, Circle } from './canvas.mjs';
import { CircularConstraint, FixedConstraint, LinearForce, LinkConstraint, Solver } from './verlet.mjs';
import { relativePointerPos, rndI, addVec, mulVec, pairs } from './misc.mjs';

// chain with 2 pinned ends and circles inside a circle
export function setup() {
    const W = 800;
    const H = 3/4 * W;

    const cv = new Canvas([W, H]);
    const sv = new Solver(8);

    const numEntities = 23;
    const p0 = [W * 0.2, H * 0.45];
    const dp = [W * 0.0275, 0];
    const r = W * 0.014;
    const lastI = numEntities - 1;

    const entities = [];

    for (let i = 0; i < numEntities; ++i) {
        const dpp = mulVec(i, dp);
        const pos = addVec(p0, dpp);
        const c = new Circle(pos, r, i % 2 === 0 ? 'blue' : 'cyan');
        entities.push(c);
    }

    const c0 = new Circle([W/2, H/2], H/2, 'black');
    cv.addObject(c0);

    const cc = new CircularConstraint([W/2, H/2], H/2, entities);
    sv.addConstraint(cc);

    const lf = new LinearForce([0, 98], entities);
    sv.addForce(lf);

    for (const o of entities) {
        cv.addObject(o);
        sv.addObject(o);
    }

    sv.addConstraint( new FixedConstraint(entities[0].pos, [entities[0]]) );
    sv.addConstraint( new FixedConstraint(entities[lastI].pos, [entities[lastI]]) );

    const td = (entities[1].pos[0] - entities[0].pos[0]) * 1.1;
    for (const [i, j] of pairs(entities.length)) {
        sv.addConstraint( new LinkConstraint(entities[i], entities[j], td) );
    }

    // add circle on click
    cv.el.addEventListener('click', (ev) => {
        const [x, y] = relativePointerPos(ev, cv.el);
        const to255 = () => rndI(255);
        const color = `rgb(${to255()}, ${to255()}, ${to255()}`;
        const r = 10 + rndI(25);

        const o = new Circle([x, y], r, color);
        cv.addObject(o);
        sv.addObject(o);
        lf.addObject(o);
        cc.addObject(o);
    });

    return { sv, cv };
}
