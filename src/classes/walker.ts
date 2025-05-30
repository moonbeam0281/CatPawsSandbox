import { PawPrint } from './pawprint';
import sittingSrc from '../assets/sitting.png';
import tailSrc from '../assets/tail.png';
import standingSrc from '../assets/standing.png'

const sittingImage = new Image();
sittingImage.src = sittingSrc;

const tailImage = new Image();
tailImage.src = tailSrc;

const standingImage = new Image()
standingImage.src = standingSrc;

console.log(standingImage);

export enum WalkerState {
    Walking = 'walking',
    Sitting = 'sitting',
    Standing = 'standing'
}

export class Walker {
    x: number;
    y: number;
    angle: number;
    speed: number;
    state: WalkerState;
    stateTimer: number;

    // Walking step sequence
    stepIndex: number = 0;
    pawprints: PawPrint[] = [];
    walkStepDelay: number = 0;
    stepDelays = [0.1, 0.2, 0.4, 0.3]; // seconds between each paw step
    lastStepTime: number = 0;
    lastStepPaws: (PawPrint | null)[] = [null, null, null, null]; // for Standing state

    // Standing paw state
    standingPaws: { x: number; y: number }[] = [];

    constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 1.5;
        this.state = WalkerState.Walking;
        this.stateTimer = 10 * 60; // 10 seconds @ 60fps
    }

    switchState() {
        const states = [WalkerState.Walking, WalkerState.Standing, WalkerState.Sitting];
        const next = states[Math.floor(Math.random() * states.length)];
        this.state = next;
        this.stateTimer = 10 * 60;
        this.stepIndex = 0;
        this.walkStepDelay = 0;
        /*
        if (this.state === WalkerState.Standing) {
            this.lastStepPaws.forEach(p => {
                if (p) p.lifted = false;
            });
        }
        */
    }

    update(canvasWidth: number, canvasHeight: number, time: number) {
        this.stateTimer--;
        if (this.stateTimer <= 0) {
            this.switchState();
        }

        if (this.state == WalkerState.Walking) {
            this.updateWalking(canvasWidth, canvasHeight, time);
        }

        // Update pawprints
        this.pawprints.forEach(p => p.update());
        this.pawprints = this.pawprints.filter(p => !p.isDead());
    }

    updateWalking(canvasWidth: number, canvasHeight: number, time: number) {
        const margin = 40;
        if (
            this.x < margin ||
            this.x > canvasWidth - margin ||
            this.y < margin ||
            this.y > canvasHeight - margin
        ) {
            this.angle += Math.PI / 2 + (Math.random() - 0.5);
        }

        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        const timeSinceLastStep = (time - this.lastStepTime) / 1000;
        if (timeSinceLastStep >= this.stepDelays[this.stepIndex]) {
            const offsets = [
                { x: -10, y: -10 }, // front left
                { x: -10, y: 10 },  // back left
                { x: 10, y: -10 },  // front right
                { x: 10, y: 10 }    // back right
            ];

            const offset = offsets[this.stepIndex];
            const dx = Math.cos(this.angle + Math.PI / 2) * offset.x;
            const dy = Math.sin(this.angle + Math.PI / 2) * offset.x;
            const fx = Math.cos(this.angle) * offset.y;
            const fy = Math.sin(this.angle) * offset.y;

            // Lift previous step
            const prevPaw = this.lastStepPaws[this.stepIndex];
            if (prevPaw) prevPaw.lifted = true;

            // Place new paw
            const newPaw = new PawPrint(this.x + dx + fx, this.y + dy + fy);
            this.pawprints.push(newPaw);
            this.lastStepPaws[this.stepIndex] = newPaw;

            this.lastStepTime = time;
            this.stepIndex = (this.stepIndex + 1) % 4;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {

        // Draw trail **first**, only if not Sitting
        if (this.state !== WalkerState.Sitting) {
            this.pawprints.forEach(p => p.draw(ctx));
        }

        if(this.state === WalkerState.Standing)
        {
            ctx.drawImage(standingImage, this.x - 226, this.y - 166, 226, 166);
        }

        if (this.state === WalkerState.Sitting) {
            // Draw sitting cat image above everything
            ctx.drawImage(sittingImage, this.x - 63, this.y - 63, 126, 126);

            // Tail sway using time-based animation
            const swayAngle = Math.sin(Date.now() / 400) * 0.3;
            ctx.save();
            ctx.translate(this.x + 5, this.y + 25);
            ctx.rotate(swayAngle);
            ctx.drawImage(tailImage, -24, -6, 32, 32);
            ctx.restore();
        }

        if (this.state === WalkerState.Standing) {
            this.standingPaws.forEach(p => {
                const tempPaw = new PawPrint(p.x, p.y);
                tempPaw.life = tempPaw.maxLife;
                tempPaw.draw(ctx);
            });
        }
    }

}