import { Canvas, Circle } from "./canvas.mjs";
import { Solver } from "./verlet.mjs";

const W = 800;
const H = 3/4 * W;

const cv = new Canvas([W, H]);
const sv = new Solver([0, 98]);

const c0 = new Circle([400, 300], 300, 'black'); // constraint

const c1 = new Circle([W * 0.33, H * 0.5], 30, 'yellow');
const c2 = new Circle([W * 0.70, H * 0.3], 30, 'orange');

cv.addObject(c0);

cv.addObject(c1);
cv.addObject(c2);

sv.addObject(c1);
sv.addObject(c2);

//let tPrev = -1000 / 60;
let tPrev = -1 / 60;

function onTick(t) {
    requestAnimationFrame(onTick);

    t = t / 1000;

    const dt = t - tPrev;

    //console.log(`dt: ${dt.toFixed(3)} | t: ${t.toFixed(3)}`);

    sv.update(dt);
    cv.drawFrame();

    tPrev = t;
}

onTick(0);
