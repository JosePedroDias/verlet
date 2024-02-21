let sv, cv, onTickInner;

const experimentNo = location.search ? parseInt(location.search.substring(1), 10) : 5;
await import(`./${experimentNo}.mjs`).then(async (mod) => {
    const result = await mod.setup();
    sv = result.sv;
    cv = result.cv;
    onTickInner = result.onTick;
});

let running = true;
let gameT = 0;
let speedMultiplier = 1;
let tPrev = -1 / 60;
function onTick(t) {
    requestAnimationFrame(onTick);

    if (!sv || !cv || !running) return;

    t = t / 1000;

    let dt = t - tPrev;
    if (dt > 1) dt = 1 / 60; // cap max read DT if above 1 sec (assume coming from background)

    dt *= speedMultiplier;

    gameT += dt;

    document.title = `fps: ${(1 / dt).toFixed(0)} speed: ${speedMultiplier.toFixed(2)}x | verlet`;

    sv.update(dt * 2.5); // speed up physics time 2.5x
    onTickInner && onTickInner(dt, t);
    cv.drawFrame();

    tPrev = t;
}

onTick(0);

document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    console.log(`running: ${running}`);
});

document.addEventListener('keydown', (ev) => {
    if (ev.key === '1') speedMultiplier = 1/9;
    if (ev.key === '2') speedMultiplier = 1/3;
    if (ev.key === '3') speedMultiplier = 1;
    if (ev.key === '4') speedMultiplier = 3;
    if (ev.key === '5') speedMultiplier = 9;
    else return;
    ev.preventDefault();
    ev.stopPropagation();
});
