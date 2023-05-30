const PI2 = 2 * Math.PI;

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

export class Circle {
    constructor(r = 10, pos = [0, 0], color = 'red') {
        this.r = r;
        this.pos = Array.from(pos);
        this.color = color;
    }

    render(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.pos[0], this.pos[1], this.r, 0, PI2, false);
        ctx.fill();
    }
}
