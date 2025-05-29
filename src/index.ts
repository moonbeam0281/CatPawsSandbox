import { Walker } from './classes/walker';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const walker = new Walker(canvas.width, canvas.height);

function animate(time: number) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  walker.update(canvas.width, canvas.height, time);
  walker.draw(ctx);
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);