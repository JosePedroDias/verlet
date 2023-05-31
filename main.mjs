import { Canvas, Circle } from "./canvas.mjs";
import { CircularConstraint, FixedConstraint, LinearForce, LinkConstraint, Solver } from "./verlet.mjs";
import { relativePointerPos, rndI, addVec, mulVec, pairs } from "./misc.mjs";

const W = 800;
const H = 3/4 * W;

const cv = new Canvas([W, H]);
const sv = new Solver(8);

if (false) {
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
}
else if (true) {
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

    /*const c0 = new Circle([W/2, H/2], H/2, 'black'); // constraint visual only
    cv.addObject(c0);

    const cc = new CircularConstraint([W/2, H/2], H/2, entities);
    sv.addConstraint(cc);*/

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
}

//let tPrev = -1000 / 60;
let tPrev = -1 / 60;

function onTick(t) {
    requestAnimationFrame(onTick);

    t = t / 1000;

    const dt = t - tPrev;

    //console.log(`dt: ${dt.toFixed(3)} | t: ${t.toFixed(3)}`);

    sv.update(dt * 2); // sped it up 2x
    cv.drawFrame();

    tPrev = t;
}

onTick(0);
