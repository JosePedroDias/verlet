import { Canvas, Circle } from './canvas.mjs';
import { CircularConstraint, LinearForce, Solver } from './verlet.mjs';
import { relativePointerPos, rndI } from './misc.mjs';

// circles inside a circle
export function setup() {
    const W = 800;
    const H = 3/4 * W;

    const cv = new Canvas([W, H]);
    const sv = new Solver(8);

    const entities = [
        new Circle([W * 0.33, H * 0.5], 30, 'yellow'),
        new Circle([W * 0.70, H * 0.3], 30, 'orange'),
        new Circle([W * 0.55, H * 0.4], 40, 'red')
    ];

    const lf = new LinearForce([0, 98], entities);
    sv.addForce(lf);

    const c0 = new Circle([W/2, H/2], H/2, 'black'); // constraint visual only
    cv.addObject(c0);

    const cc = new CircularConstraint([W/2, H/2], H/2, entities);
    sv.addConstraint(cc);

    // add circle on click
    cv.el.addEventListener('click', (ev) => {
        const [x, y] = relativePointerPos(ev, cv.el);
        const to255 = () => rndI(255);
        const color = `rgb(${to255()}, ${to255()}, ${to255()}`;
        const r = 15 + rndI(30);

        const o = new Circle([x, y], r, color);
        cv.addObject(o);
        sv.addObject(o);
        lf.addObject(o);
        cc.addObject(o);
    });

    for (const o of entities) {
        cv.addObject(o);
        sv.addObject(o);
    }

    return { sv, cv };
}
