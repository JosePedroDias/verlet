import { Canvas, Circle, Label } from './canvas.mjs';
import { LinearForce, FixedConstraint, Solver } from './verlet.mjs';
import { relativePointerPos, randomColor, cartesianToPolar, subVec, POINTER_EVENTS, DEG2RAD } from './misc.mjs';
import { createBottomLine, createPlinko, updatePlinko, hexToCartesian, HEX_FACTOR } from './plinko.mjs';

const KIND_MOVING   = 1;
const KIND_DETECTOR = 2;
const KIND_GOAL     = 3;

const LIMIT_COLOR   = undefined; // 'gray';
const PEG_COLOR     = 'orange';
const BARRIER_COLOR = 'cyan';
const GOAL_COLOR    = 'green';

const levelNr = location.hash ? parseInt(location.hash.substring(1), 10) : 1;

// plinko 2
export async function setup() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const M = Math.min(W, H);

    const XC = 0.5 * W;
    const YC = 0.5 * H;

    const CENTER = [XC, YC];
    const BALL_SPAWN = [XC, 0.1 * H];

    const PEG_R = 0.005 * M;
    const BARRIER_R = 0.0035 * M;
    const BALL_R = 0.023 * M;
    const GOAL_R = 0.5 * BALL_R;

    const LAST_LEVEL = 3;

    let toRemove = [];
    let angle = 0;
    let nextDropT = 0;

    const cv = new Canvas([W, H]);
    const sv = new Solver(
        2, // subSteps
        (a, b) => {
            const moving = a.kind === KIND_MOVING ? a : b;
            const other = a === moving ? b : a;
            if (other.kind === KIND_GOAL) {
                if (levelNr >= LAST_LEVEL) {
                    console.log('no more levels');
                    toRemove.push(other);
                    //return window.alert('no more levels');
                } else {
                    location.hash = levelNr + 1;
                    location.reload();
                    toRemove.push(moving);
                }
            }
            if (other.kind === KIND_DETECTOR) {
                console.log('oops');
                toRemove.push(moving);
            }
        }, // onCollisionFn
        (a, b) => { // requiresCollisionFn
            return a.kind === KIND_MOVING || b.kind === KIND_MOVING;
        },
    );

    const countDownLabel = new Label(BALL_SPAWN, '#DDD', `bold ${Math.round(0.015 * W)}px sans-serif`);
    cv.addObject(countDownLabel);

    const level = await import(`./level${levelNr.toString().padStart(2, '0')}.mjs`).then((mod) => mod.default);

    const gravityF = new LinearForce([0, 98]);
    sv.addForce(gravityF);

    if (true) {
        const thickness = 0.025 * M;
        const pad = thickness;
        //const pad = -2*thickness;
        const p0 = [0 - pad, 0 - pad];
        const p1 = [W + pad, H + pad];
        //createLimitLines(p0, p1, sv, cv, thickness, KIND_DETECTOR, LIMIT_COLOR)
        createBottomLine(p0, p1, sv, cv, thickness, KIND_DETECTOR, LIMIT_COLOR)
    }

    const [dx, dy] = level.size;
    const barrierCfgs = level.barrierCfgs;
    const goals = level.goals;
    nextDropT += level.dropEverySecs;
    angle = level.angle * DEG2RAD;

    const hexPositions = [];
    {
        for (let j = -dy; j <= dy; j++) {
            for (let i = -dx; i <= dx; i++) {
                if (i === dx && j % 2 !== 0) continue;
                hexPositions.push([i, j]);
            }
        }
    }
    //console.log(hexPositions);

    const SCALE = 0.09 * M;

    const { positions, barrierPositions } = createPlinko(
        hexPositions,
        barrierCfgs,
        SCALE,
        sv, cv,
        PEG_COLOR,
        BARRIER_COLOR,
        PEG_R,
        BARRIER_R,
    );

    const goalPositions = goals.map((goalHex) => {
        const sx = SCALE;
        const sy = SCALE * HEX_FACTOR;
        const p0 = hexToCartesian(goalHex);
        p0[0] *= sx;
        p0[1] *= sy;
        p0[1] += 0.5 * sy;
        const o = new Circle(Array.from(p0), GOAL_R, GOAL_COLOR);
        o.kind = KIND_GOAL;
        cv.addObject(o);
        sv.addObject(o);
        sv.addConstraint( new FixedConstraint(p0, [o], true) );
        return p0;
    });

    const polarPositions = positions.map(cartesianToPolar);
    const polarBarrierPositions = barrierPositions.map(cartesianToPolar);
    const polarGoalPositions = goalPositions.map(cartesianToPolar);

    function addCircle(pos) {
        const o = new Circle(pos, BALL_R, randomColor());
        o.kind = KIND_MOVING;
        cv.addObject(o);
        sv.addObject(o);
        gravityF.addObject(o);
    }

    let lastMousePos;

    cv.el.addEventListener(POINTER_EVENTS.down, (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        lastMousePos = subVec(relativePointerPos(ev, cv.el), CENTER);
    });

    cv.el.addEventListener(POINTER_EVENTS.up, (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        lastMousePos = undefined;
    });

    cv.el.addEventListener(POINTER_EVENTS.move, (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        if (!lastMousePos) return;
        const pos = subVec(relativePointerPos(ev, cv.el), CENTER);
        const [_,  a0] = cartesianToPolar(lastMousePos);
        const [__, a1] = cartesianToPolar(pos);
        angle += a1 - a0;
        lastMousePos = pos;
    });

    const onTick = (dt, t) => {
        countDownLabel.text = (nextDropT - t).toFixed(2);
        if (t > nextDropT) {
            addCircle([
                XC + (-0.5 + Math.random()) * SCALE,
                0.1 * H,
            ]);
            nextDropT += level.dropEverySecs;
        }

        //angle += 0.25 * dt;
        updatePlinko(positions, polarPositions, CENTER, angle);
        updatePlinko(barrierPositions, polarBarrierPositions, CENTER, angle);
        updatePlinko(goalPositions, polarGoalPositions, CENTER, angle);

        for (const o of toRemove) {
            cv.removeObject(o);
            sv.removeObject(o);
            gravityF.removeObject(o);
        }
        toRemove = [];
    };

    return { sv, cv, onTick };
}
