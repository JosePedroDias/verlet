import { Canvas, Circle } from "./canvas.mjs";

const cv = new Canvas([400, 300]);

const c1 = new Circle(30, [200, 150], 'yellow');
const c2 = new Circle(45, [250, 150], 'orange');
cv.addObject(c1);
cv.addObject(c2);
cv.drawFrame();