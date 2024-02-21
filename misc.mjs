export const RAD2DEG = 180 / Math.PI;

export const RAD45  = 0.25 * Math.PI;
export const RAD60  = 1/3  * Math.PI;
export const RAD90  = 0.5  * Math.PI;
export const RAD180 =        Math.PI;
export const RAD270 = 1.5  * Math.PI;

export function addVec([x, y], [z, w]) {
    return [x + z, y + w];
}

export function subVec([x, y], [z, w]) {
    return [x - z, y - w];
}

export function distBetween([x, y], [z, w]) {
    const dx = x - z;
    const dy = y - w;
    return Math.sqrt(dx * dx + dy * dy);
}

export function dist([x, y]) {
    return Math.sqrt(x * x + y * y);
}

export function mulVec(scalar, [x, y]) {
    return [
        scalar * x,
        scalar * y
    ];
}

export function setVec(to, from) {
    to[0] = from[0];
    to[1] = from[1];
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

export function extractElementOffset(el) {
    const bcr = el.getBoundingClientRect();
    return [
        bcr.left,
        bcr.top,
    ];
}

export function extractMousePosition(ev) {
    return [
        ev.pageX,
        ev.pageY,
    ];
}

export function relativePointerPos(ev, el) {
    return subVec(
        extractMousePosition(ev),
        extractElementOffset(el),
    );
}

export function rndI(n) {
    return Math.floor(n * Math.random());
}

const to255 = () => 55 + rndI(200);

export function randomColor() {
    return `rgb(${to255()}, ${to255()}, ${to255()})`;
}

export function lerp(a, b, t) {
    return (1 - t) * a + t * b;
}

export function lerp2(a, b, t) {
    const t_ = 1 - t;
    return [
        t_ * a[0] + t * b[0],
        t_ * a[1] + t * b[1],
    ];
}

export function polarToCartesian([r, theta]) {
    return [
        r * Math.cos(theta),
        r * Math.sin(theta),
    ];
}

export function cartesianToPolar([x, y]) {
    return [
        Math.sqrt(x * x + y * y),
        Math.atan2(y, x),
    ];
}
