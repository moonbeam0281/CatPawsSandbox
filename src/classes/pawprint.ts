import pawSrc from '../assets/paw.png';

const pawImage = new Image();
pawImage.src = pawSrc;

export class PawPrint {
  x: number;
  y: number;
  life: number;
  delay: number;
  maxLife: number;
  lifted: boolean;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.maxLife = 300; // total life span
    this.delay = 300;   // delay before fade
    this.life = this.maxLife;
    this.lifted = false;
  }

  update() {
    if (this.lifted) {
      this.life -= 1;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const fadeStart = this.maxLife - this.delay;
    const fadeDuration = this.delay;
    const currentAge = this.maxLife - this.life;
    const alpha = !this.lifted
      ? 1
      : currentAge < fadeStart
      ? 1
      : Math.max(0, 1 - (currentAge - fadeStart) / fadeDuration);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.drawImage(pawImage, this.x - 16, this.y - 16, 32, 32);
    ctx.restore();
  }

  isDead() {
    return this.lifted && this.life <= 0;
  }
}
