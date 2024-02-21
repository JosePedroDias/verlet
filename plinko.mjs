import { RAD180, RAD270, RAD90, RAD60, addVec, polarToCartesian, subVec } from './misc.mjs';
import { Circle } from './canvas.mjs';
import { FixedConstraint } from './verlet.mjs';

export function hexToCartesian([i, j]) {
    const xPad = j % 2 === 0 ? 0 : 0.5;
    return [
        i + xPad,
        j,
    ];
}

export function generateLine(p0, [length, angle], thickness, color) {
    const diameter = 2 * thickness;

    const nFloat = length / diameter;
    const nStart = nFloat - Math.floor(nFloat);
    const n = Math.floor(nFloat);

    const circles = [];
    for (let i = 0; i < n; ++i) {
        const pos = addVec(p0, polarToCartesian([(nStart + i) * diameter, angle]));
        const o = new Circle(pos, thickness, color);
        circles.push(o);
    }

    return circles;
};

export function createBottomLine(p0, p1, sv, cv, thickness, kind, color) {
    let [DX, DY] = subVec(p1, p0);

    DX += thickness;
    DY += thickness;

    const all = generateLine(p1, [DX, RAD180], thickness, color);

    for (const o of all) {
        o.kind = kind;
        sv.addObject(o);
        color && cv.addObject(o);
        sv.addConstraint( new FixedConstraint(o.pos, [o]) );
    }
}

export function createLimitLines(p0, p1, sv, cv, thickness, kind, color) {
    let [DX, DY] = subVec(p1, p0);

    DX += thickness;
    DY += thickness;

    const lineTop    = generateLine(p0, [DX, 0],      thickness, color);
    const lineLeft   = generateLine(p0, [DY, RAD90],  thickness, color);
    const lineBottom = generateLine(p1, [DX, RAD180], thickness, color);
    const lineRight  = generateLine(p1, [DY, RAD270], thickness, color);

    const all = [
        ...lineTop,
        ...lineLeft,
        ...lineBottom,
        ...lineRight,
    ];

    for (const o of all) {
        o.kind = kind;
        sv.addObject(o);
        color && cv.addObject(o);
        sv.addConstraint( new FixedConstraint(o.pos, [o]) );
    }
}

export const HEX_FACTOR = 0.5 * Math.tan(RAD60);

export function createPlinko(hexPositions, barrierCfgs, scale, r, sv, cv, color) {
    const sx = scale;
    const sy = scale * HEX_FACTOR;

    const positions = hexPositions.map(hexToCartesian).map(([x, y]) => [sx * x, sy * y]);

    const circles = positions.map((pos) => new Circle(Array.from(pos), r, color));

    let i = 0;
    for (const o of circles) {
        sv.addObject(o);
        color && cv.addObject(o);
        sv.addConstraint( new FixedConstraint(positions[i++], [o], true) );
    }

    const barriers = [];
    let barrierCircles = [];
    const barrierPositions = [];
    const rr = r*1.5;
    const barrierColor = 'orange';
    i = 0;

    for (const [hexPos, dos] of barrierCfgs) {
        const p0 = hexToCartesian(hexPos);
        p0[0] *= sx;
        p0[1] *= sy;

        if (dos.indexOf(0) !== -1) {
            const lineHor       = generateLine(p0, [scale,    0    ], rr, barrierColor);
            barriers.push(lineHor);       barrierCircles = barrierCircles.concat(lineHor);
        }
        if (dos.indexOf(1) !== -1) {
            const lineBackslash = generateLine(p0, [scale, -  RAD60], rr, barrierColor);
            barriers.push(lineBackslash); barrierCircles = barrierCircles.concat(lineBackslash);
        }
        if (dos.indexOf(2) !== -1) {
            const lineSlash     = generateLine(p0, [scale, -2*RAD60], rr, barrierColor);
            barriers.push(lineSlash);     barrierCircles = barrierCircles.concat(lineSlash);
        }
    }

    for (const o of barrierCircles) {
        const pos2 = Array.from(o.pos);
        barrierPositions.push(pos2);
        sv.addObject(o);
        color && cv.addObject(o);
        sv.addConstraint( new FixedConstraint(pos2, [o], true) );
    }

    return {
        positions, circles,
        barrierCircles, barrierPositions,
        barriers,
    };
}

export function updatePlinko(positions, polarPositions, [XC, YC], angle) {
    for (let i = 0; i < positions.length; ++i) {
        const [r, angle0] = polarPositions[i];
        const [x0, y0] = polarToCartesian([r, angle0 + angle]);

        const pos = positions[i];
        pos[0] = x0 + XC;
        pos[1] = y0 + YC;
    }
}
