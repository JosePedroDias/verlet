import { Canvas, Circle } from "./canvas.mjs";
import { Solver } from "./verlet.mjs";

const W = 800;
const H = 3/4 * W;

const cv = new Canvas([W, H]);
const sv = new Solver([0, 98]);

const c1 = new Circle([W/2, H/10], 10, 'yellow');
//const c2 = new Circle([250, 150], 45, 'orange');
cv.addObject(c1);
//cv.addObject(c2);
//cv.drawFrame();
sv.addObject(c1);

//cv.drawFrame();

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

/*
window.cv = cv;
window.sv = sv;
window.c1 = c1;
*/
