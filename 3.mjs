import { Canvas, Circle, Rectangle } from './canvas.mjs';
import { RectangularConstraint, FixedConstraint, LinearForce, Solver } from './verlet.mjs';
import { relativePointerPos, rndI } from './misc.mjs';

const to255 = () => 55 + rndI(200);
const randomColor = () => `rgb(${to255()}, ${to255()}, ${to255()}`;

// plinko
export function setup() {
    const W = 700;
    const H = 1.5 * W;

    const cv = new Canvas([W, H]);
    const sv = new Solver(2);

    const movingEntities = [];

    const r0 = new Rectangle([W/2, H/2], [0.82 * W, 0.86 * H], 'black');
    cv.addObject(r0);
    const rectConst = new RectangularConstraint([W/2, H/2], [0.82 * W, 0.86 * H], movingEntities);
    sv.addConstraint(rectConst);

    const PEG_R = 4;
    const BALL_R = 14;

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
        movingEntities.push(o);
        cv.addObject(o);
        sv.addObject(o);
        rectConst.addObject(o);
    }

    // pinko pegs
    {
        const cx = W * 0.5;
        const cy = H * 0.5;
        const dx = W * 0.07;
        const dy = dx * 0.85;
        for (let yi = -7; yi <= 7; ++yi) {
            for (let xi = -6; xi <= 5; ++xi) {
                const isOddY = yi % 2 !== 0;
                if (xi === -6 && !isOddY) continue;
                const x = cx + (xi + (isOddY ? 0.5 : 0)) * dx;
                const y = cy + yi * dy;
                const o = new Circle([x, y], PEG_R, 'blue');
                cv.addObject(o);
                sv.addObject(o);

                sv.addConstraint( new FixedConstraint(o.pos, [o]) );
            }
        }

        for (let xi = -5; xi <= 5; ++xi) {
            generateLine({
                x0: cx + xi * dx,
                y0: H * 0.83,
                dx: 0,
                dy: 10,
                r: 4,
                n : 10,
                color: 'gray',
            });
        }
    }

    const gravityF = new LinearForce([0, 98], movingEntities);
    sv.addForce(gravityF);

    // add circle on click
    cv.el.addEventListener('click', (ev) => {
        const pos = relativePointerPos(ev, cv.el);
        const o = new Circle(pos, BALL_R, randomColor());
        cv.addObject(o);
        sv.addObject(o);
        gravityF.addObject(o);
        rectConst.addObject(o);
    });

    return { sv, cv };
}
