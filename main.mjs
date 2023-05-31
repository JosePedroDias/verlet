import { Canvas, Circle } from "./canvas.mjs";
import { Solver } from "./verlet.mjs";

const W = 800;
const H = 3/4 * W;

const cv = new Canvas([W, H]);
const sv = new Solver([0, 98]);

const c0 = new Circle([400, 300], 300, 'black'); // constraint

const entities = [
    new Circle([W * 0.33, H * 0.5], 30, 'yellow'),
    new Circle([W * 0.70, H * 0.3], 30, 'orange'),
    new Circle([W * 0.55, H * 0.4], 40, 'red')
];

// add circle on click
cv.el.addEventListener('click', (ev) => {
    const { left, top } = cv.el.getBoundingClientRect();
    const x = ev.pageX - left;
    const y = ev.pageY - top;
    const to255 = () => Math.floor(255 * Math.random());
    const color = `rgb(${to255()}, ${to255()}, ${to255()}`;
    const r = 15 + Math.floor(30 * Math.random());

    const o = new Circle([x, y], r, color);
    cv.addObject(o);
    sv.addObject(o);
    //console.log([x, y]);
});

cv.addObject(c0);
for (const o of entities) {
    cv.addObject(o);
    sv.addObject(o);
}

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
