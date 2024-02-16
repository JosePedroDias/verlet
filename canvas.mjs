const PI2 = 2 * Math.PI;

import { VerletObject } from "./verlet.mjs";

export class Canvas {
    constructor(dims = [400, 300]) {
        this.dims = Array.from(dims);
        const el = document.createElement('canvas');
        el.setAttribute('width', dims[0]);
        el.setAttribute('height', dims[1]);
        document.body.appendChild(el);
        this.el = el;
        this.ctx = el.getContext('2d');

        this.objects = [];
    }

    addObject(o) {
        this.objects.push(o);
    }

    drawFrame() {
        this.ctx.clearRect(0, 0, this.dims[0], this.dims[1]);
        for (const o of this.objects) {
            o.render(this.ctx);
        }
    }
}

export class Circle extends VerletObject {
    constructor(pos = [0, 0], r = 10, color = 'red') {
        super(pos);
        this.r = r;
        this.color = color;
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos[0], this.pos[1], this.r, 0, PI2, false);
        ctx.fill();
    }
}

export class Rectangle extends VerletObject {
    constructor(pos = [0, 0], dims = [100, 100], color = 'red') {
        super(pos);
        this.dims = dims;
        this.color = color;
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(
            this.pos[0] - this.dims[0]/2,
            this.pos[1] - this.dims[1]/2,
            this.dims[0],
            this.dims[1],
        );
    }
}
