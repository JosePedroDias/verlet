export function addVec([x, y], [z, w]) {
    return [x + z, y + w];
}

export function subVec([x, y], [z, w]) {
    return [x - z, y - w];
}

export function dist([x, y], [z, w]) {
    const dx = x - z;
    const dy = y - w;
    return Math.sqrt(dx * dx + dy * dy);
}

export function mulVec(scalar, [x, y]) {
    return [
        scalar * x,
        scalar * y
    ];
}

export function* combine2(n) {
    for (let i = 0; i < n; ++i) {
        for (let j = 0; j < n; ++j) {
            if (i < j) {
                yield [i, j];
            }
        }   
    }
}

export function* pairs(n) {
    for (let i = 0; i < n - 1; ++i) {
        yield [i, i + 1];
    }
}

export function relativePointerPos(ev, el) {
    const { left, top } = el.getBoundingClientRect();
    const x = ev.pageX - left;
    const y = ev.pageY - top;
    return [x, y];
}

export function rndI(n) {
    return Math.floor(n * Math.random());
}
