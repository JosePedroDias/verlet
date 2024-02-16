let sv, cv;

const experimentNo = location.search ? parseInt(location.search.substring(1), 10) : 0;
await import(`./${experimentNo}.mjs`).then((mod) => {
    const result = mod.setup();
    sv = result.sv;
    cv = result.cv;
});


let tPrev = -1 / 60;
function onTick(t) {
    requestAnimationFrame(onTick);

    if (!sv || !cv) return;

    t = t / 1000;

    const dt = t - tPrev;

    document.title = `exp #${experimentNo} | fps: ${(1 / dt).toFixed(1)}`;

    sv.update(dt * 2.5); // sped it up 2.5x
    cv.drawFrame();

    tPrev = t;
}

onTick(0);
