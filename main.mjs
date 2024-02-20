let sv, cv, onTickInner;

const experimentNo = location.search ? parseInt(location.search.substring(1), 10) : 0;
await import(`./${experimentNo}.mjs`).then((mod) => {
    const result = mod.setup();
    sv = result.sv;
    cv = result.cv;
    onTickInner = result.onTick;
});


let tPrev = -1 / 60;
function onTick(t) {
    requestAnimationFrame(onTick);

    if (!sv || !cv) return;

    t = t / 1000;

    const dt = t - tPrev;

    document.title = `fps: ${(1 / dt).toFixed(0)} | verlet`;

    sv.update(dt * 2.5); // sped it up 2.5x
    onTickInner && onTickInner(dt, t);
    cv.drawFrame();

    tPrev = t;
}

onTick(0);
