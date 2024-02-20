import { Canvas, Circle, Rectangle, Label } from './canvas.mjs';
import { RectangularConstraint, FixedConstraint, LinearForce, Solver } from './verlet.mjs';
import { relativePointerPos, subVec, dist, rndI } from './misc.mjs';

const to255 = () => 55 + rndI(200);
const randomColor = () => `rgb(${to255()}, ${to255()}, ${to255()})`;

const KIND_MOVING = 1;
const KIND_DETECTOR = 2;

const PEG_COLOR = 'blue';
const SLOT_COLOR = 'gray';

// plinko
export function setup() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const M = Math.min(W, H);

    const SLOT_COUNTS = [];
    const SLOT_LABELS = [];
    const SLOT_DETECTORS = [];

    let toRemove = [];

    const cv = new Canvas([W, H]);
    const sv = new Solver(
        1, // subSteps
        undefined, // onCollisionFn
        (a, b) => { // requiresCollisionFn
            if (a.kind !== KIND_MOVING && b.kind !== KIND_MOVING) return false;

            let movingBall;
            if      (a.kind === KIND_MOVING) movingBall = a;
            else if (b.kind === KIND_MOVING) movingBall = b;

            if (!movingBall) return true;

            const otherBall = movingBall === a ? b : a;

            if (otherBall.kind !== KIND_DETECTOR) return true;

            if (toRemove.includes(otherBall)) return false;

            // discard if they're not colliding yet
            const collAxis = subVec(a.pos, b.pos);
            const di = dist(collAxis);
            const minDist = a.r + b.r;
            if (di >= minDist) return false;

            const slotIndex = SLOT_DETECTORS.indexOf(otherBall);
            const count = SLOT_COUNTS[slotIndex] + 1;
            SLOT_COUNTS[slotIndex] = count;
            const label = SLOT_LABELS[slotIndex];
            label.setText(`${count}`);

            toRemove.push(movingBall);

            return false;
        },
    );

    const movingEntities = [];
    const r0 = new Rectangle([W/2, H/2], [0.82 * W, 0.86 * H], 'black');
    cv.addObject(r0);
    const rectConst = new RectangularConstraint([W/2, H/2], [0.82 * W, 0.86 * H], movingEntities);
    sv.addConstraint(rectConst);

    const PEG_R = 0.0035 * M;
    const BALL_R = 0.028 * M;
    const SLOT_R = PEG_R * 1.2;

    const generateLine = ({ x0, y0, dx, dy, n, r, color }) => {
        let x = x0;
        let y = y0;
        for (let i = 0; i < n; ++i) {
            const o = new Circle([x, y], r, color);
            cv.addObject(o);
            sv.addObject(o);
            sv.addConstraint( new FixedConstraint(o.pos, [o]) );
            x += dx;
            y += dy;
        }
    };

    // initial ball
    {
        const o = new Circle(
            [
                W * 0.5 + (0.2 * Math.random() - 0.1),
                H * 0.09
            ],
            BALL_R,
            randomColor()
        );
        o.kind = KIND_MOVING;
        movingEntities.push(o);
        cv.addObject(o);
        sv.addObject(o);
        rectConst.addObject(o);
    }

    // pinko pegs
    {
        const cx = W * 0.5;
        const cy = H * 0.5;
        const dx = W * 0.095;
        const dy = dx * 0.85;

        const limitX = 4;
        const limitY = Math.floor(H / dy * 0.3);

        // pegs
        for (let yi = -limitY; yi <= limitY; ++yi) {
            for (let xi = -limitX; xi <= limitX; ++xi) {
                const isOddY = yi % 2 === 0;
                if (
                    (!isOddY && (xi === -limitX - 1)) ||
                    ( isOddY && (xi ===  limitX   ))
                ) continue;

                const x = cx + (xi + (isOddY ? 0.5 : 0)) * dx;
                const y = cy + yi * dy;
                const o = new Circle([x, y], PEG_R, PEG_COLOR);
                cv.addObject(o);
                sv.addObject(o);

                sv.addConstraint( new FixedConstraint(o.pos, [o]) );
            }
        }

        //slots
        for (let xi = -limitX; xi <= limitX; ++xi) {
            const x0 = cx + xi * dx;
            const y0 = cy + (limitY + 1) * dy;
            const n = 1 + Math.ceil( (H - y0) / (2 * SLOT_R) * 0.5);
            generateLine({
                x0,
                y0,
                dx: 0,
                dy: 2 * SLOT_R,
                r: SLOT_R,
                n,
                color: SLOT_COLOR,
            });

            if (xi === limitX) continue;

            const x1 = x0 + 0.5 * dx;
            const y1 = 0.95 * H;
            const t = new Label([x1, y1], '#DDD', `bold ${Math.round(0.02 * W)}px sans-serif`);
            t.setText('0');
            cv.addObject(t);

            const o = new Circle([x1, y1 - dy * 0.5], BALL_R/2);
            o.kind = KIND_DETECTOR;
            //cv.addObject(o);
            sv.addObject(o);

            SLOT_COUNTS.push(0);
            SLOT_LABELS.push(t);
            SLOT_DETECTORS.push(o);
        }
    }

    const gravityF = new LinearForce([0, 98], movingEntities);
    sv.addForce(gravityF);

    // add circle on click
    cv.el.addEventListener('click', (ev) => {
        const pos = relativePointerPos(ev, cv.el);
        const o = new Circle(pos, BALL_R, randomColor());
        o.kind = KIND_MOVING;
        cv.addObject(o);
        sv.addObject(o);
        gravityF.addObject(o);
        rectConst.addObject(o);
    });

    const onTick = (dt, t) => {
        for (const movingBall of toRemove) {
            cv.removeObject(movingBall);
            sv.removeObject(movingBall);
            gravityF.removeObject(movingBall);
            rectConst.removeObject(movingBall);
        }
        toRemove = [];
    };

    return { sv, cv, onTick };
}
