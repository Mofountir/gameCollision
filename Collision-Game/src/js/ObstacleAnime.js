/**
 * Classe représentant un obstacle en mouvement
 */
class ObstacleAnime extends Obstacle {
    constructor(x, y, width, height, speedX, speedY) {
        super(x, y, width, height);
        this.speedX = speedX;
        this.speedY = speedY;
        this.color = '#ff4757';
        this.initialX = x;
        this.initialY = y;
        this.distance = 100;
        this.rotationAngle = 0;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.rotationAngle += 0.1;

        const dx = this.x - this.initialX;
        const dy = this.y - this.initialY;
        
        if (Math.abs(dx) > this.distance) {
            this.speedX = -this.speedX;
            this.x = this.initialX + (this.distance * Math.sign(dx));
        }
        
        if (Math.abs(dy) > this.distance) {
            this.speedY = -this.speedY;
            this.y = this.initialY + (this.distance * Math.sign(dy));
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        ctx.rotate(this.rotationAngle);
        
        // Corps avec rotation
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.width/2);
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#ff4757');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.width/2, 0, Math.PI * 2);
        ctx.fill();
        
        // Yeux qui tournent
        const eyeDistance = this.width * 0.2;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-eyeDistance, -eyeDistance, this.width * 0.15, 0, Math.PI * 2);
        ctx.arc(eyeDistance, -eyeDistance, this.width * 0.15, 0, Math.PI * 2);
        ctx.fill();
        
        // Pupilles
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(-eyeDistance, -eyeDistance, this.width * 0.07, 0, Math.PI * 2);
        ctx.arc(eyeDistance, -eyeDistance, this.width * 0.07, 0, Math.PI * 2);
        ctx.fill();
        
        // Bouche méchante qui tourne
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, eyeDistance, this.width * 0.15, 0, Math.PI, true);
        ctx.stroke();
        
        ctx.restore();
    }
}