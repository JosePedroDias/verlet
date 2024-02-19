import { Canvas, Circle, Rectangle } from './canvas.mjs';
import { RectangularConstraint, FixedConstraint, LinearForce, Solver } from './verlet.mjs';
import { RAD2DEG, addVec, subVec, mulVec, setVec, relativePointerPos, rndI } from './misc.mjs';

const to255 = () => 55 + rndI(200);
const randomColor = () => `rgb(${to255()}, ${to255()}, ${to255()})`;

class Cannon {
    constructor(pos, width = 60, thickness = 20, color = 'red') {
        this.angle = 0;

        this.pos = pos;
        this.width = width;
        this.thickness = thickness;
        this.color = color;
    }

    setAngle(a) {
        this.angle = a;
    }

    getVersor() {
        return [
            Math.cos(this.angle),
            Math.sin(this.angle),
        ];
    }

    render(ctx) {
        const [vx, vy] = this.getVersor();

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.thickness;
        ctx.beginPath();
        ctx.moveTo(
            this.pos[0],
            this.pos[1],
        );
        ctx.lineTo(
            this.pos[0] + vx * this.width,
            this.pos[1] + vy * this.width,
        );
        ctx.stroke();
    }
}

//const KIND_AUX = 0;
const KIND_MOVING = 1;
const KIND_FIXED_ON_RING = 2;

// shooter
export function setup() {
    const W = 700;
    const H = 1.5 * W;

    const BALL_R = 14;

    const ORIGIN = [W * 0.5, H * 0.07]; // where balls are shot from

    const CENTER = [0.5 * W, 0.47 * H];
    const r0 = W * 0.105;
    const RADIUSES = [
        r0,
        r0 + BALL_R * 2.05,
        r0 + BALL_R * 4.10,
    ];
    const CENTER_BALL_R = r0 - BALL_R * 1.05;
    const AMOUNTS = [
        16,
        22,
        28,
    ];

    let centerAngle = 0;
    const FIXED_BALL_POSITIONS = new Array(AMOUNTS.reduce((prev, v) => prev + v));

    const updateFixedBallPositions = () => {
        //console.log((centerAngle * RAD2DEG).toFixed(1));
        let k = 0;
        for (let i = 0; i < 3; ++i) {
            const amount = AMOUNTS[i];
            const r = RADIUSES[i];

            for (let j = 0; j < amount; ++j) {
                const angle = 2 * Math.PI * j / amount + centerAngle;
                const pos = addVec(CENTER, mulVec(r, [Math.cos(angle), Math.sin(angle)]));
                if (!FIXED_BALL_POSITIONS[k]) FIXED_BALL_POSITIONS[k] = pos;
                else setVec(FIXED_BALL_POSITIONS[k], pos);
                ++k;
            }
        }
    };
    updateFixedBallPositions();

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

    const ADD_CENTER_BALL = false;

    const movingEntities = [];
    const rectConst = new RectangularConstraint([W/2, H/2], [0.82 * W, 0.86 * H], movingEntities);

    const cv = new Canvas([W, H]);
    const sv = new Solver(
        2, // subSteps
        (a, b) => { // onCollisionFn
            let ringBall;
            if      (a.kind === KIND_FIXED_ON_RING) ringBall = a;
            else if (b.kind === KIND_FIXED_ON_RING) ringBall = b;

            if (!ringBall) return;

            ringBall.kind = KIND_MOVING;
            gravityF.addObject(ringBall);
            rectConst.addObject(ringBall);
            sv.removeConstraint(ringBall.constraint);
            delete ringBall.constraint;
        },
        (a, b) => { // requiresCollisionFn
            //return true;
            return a.kind === KIND_MOVING || b.kind === KIND_MOVING;
        },
    );

    const rect0 = new Rectangle([W/2, H/2], [0.82 * W, 0.86 * H], 'black');
    cv.addObject(rect0);

    sv.addConstraint(rectConst);

    const cannon = new Cannon(Array.from(ORIGIN), 60, 20, 'gray');
    cv.addObject(cannon);

    const gravityF = new LinearForce([0, 98], movingEntities);
    sv.addForce(gravityF);

    if (ADD_CENTER_BALL) {
        const o = new Circle(CENTER, CENTER_BALL_R, randomColor());
        cv.addObject(o);
        sv.addObject(o);
        rectConst.addObject(o);
        sv.addConstraint( new FixedConstraint(o.pos, [o]) );
    }

    // center balls
    let k = 0;
    for (let i = 0; i < 3; ++i) {
        const amount = AMOUNTS[i];
        for (let j = 0; j < amount; ++j) {
            const pos = Array.from(FIXED_BALL_POSITIONS[k]);
            const o = new Circle(pos, BALL_R, randomColor());
            o.kind = KIND_FIXED_ON_RING;
            cv.addObject(o);
            sv.addObject(o);

            const constraint = new FixedConstraint(FIXED_BALL_POSITIONS[k], [o], true);
            o.constraint = constraint;
            sv.addConstraint(constraint);
            ++k;
        }
    }

    generateLine({
        x0: W * 0.12,
        y0: H * 0.82,
        dx: 25,
        dy: 7,
        n: 7,
        r: BALL_R,
        color: 'gray',
    });

    generateLine({
        x0: W * (1 - 0.12),
        y0: H * 0.82,
        dx: -25,
        dy: 7,
        n: 7,
        r: BALL_R,
        color: 'gray',
    });

    // add circle on click
    cv.el.addEventListener('click', () => {
        const pos = addVec(ORIGIN, mulVec(cannon.width, cannon.getVersor()));
        const o = new Circle(pos, BALL_R, randomColor());
        o.kind = KIND_MOVING;
        o.accel = mulVec(13000, cannon.getVersor());
        cv.addObject(o);
        sv.addObject(o);
        gravityF.addObject(o);
        rectConst.addObject(o);
    });

    // move cannon on move
    cv.el.addEventListener('mousemove', (ev) => {
        const pos0 = relativePointerPos(ev, cv.el);
        const pos = subVec(pos0, ORIGIN);

        const angle = Math.atan2(pos[1], pos[0]);
        cannon.setAngle(angle);
        //console.log((angle * RAD2DEG).toFixed(1));
    });

    const onTick = (dt, t) => {
        centerAngle += 0.25 * dt;
        updateFixedBallPositions();
        /*if (t > 2) {
            console.log(FIXED_BALL_POSITIONS[0]);
            //breakpoint;
        }*/
    };

    return { sv, cv, onTick };
}
