/**
 * Classe représentant le joueur sous forme d'un petit monstre
 */
class Player extends ObjetGraphique {
    constructor(x, y) {
        super(x, y, 30, 30, '#6366f1');
        this.speed = 4;
        this.startX = x;
        this.startY = y;
        this.eyeAngle = 0;
        // Nouveaux paramètres pour l'effet de collision
        this.bumpEffect = {
            active: false,
            scale: 1,
            rotation: 0,
            squish: 0
        };
    }

    triggerBumpEffect() {
        this.bumpEffect.active = true;
        this.bumpEffect.scale = 1.3;
        this.bumpEffect.rotation = (Math.random() - 0.5) * 0.5;
        this.bumpEffect.squish = 0.7;
    }

    updateBumpEffect() {
        if (this.bumpEffect.active) {
            this.bumpEffect.scale += (1 - this.bumpEffect.scale) * 0.2;
            this.bumpEffect.rotation *= 0.8;
            this.bumpEffect.squish += (1 - this.bumpEffect.squish) * 0.2;
            
            if (Math.abs(this.bumpEffect.scale - 1) < 0.01) {
                this.bumpEffect.active = false;
                this.bumpEffect.scale = 1;
                this.bumpEffect.rotation = 0;
                this.bumpEffect.squish = 1;
            }
        }
    }

    draw(ctx) {
        this.updateBumpEffect();
        this.eyeAngle += 0.1;

        ctx.save();
        // Appliquer les transformations de collision
        ctx.translate(this.x + this.width/2, this.y + this.height/2);
        if (this.bumpEffect.active) {
            ctx.rotate(this.bumpEffect.rotation);
            ctx.scale(this.bumpEffect.scale / this.bumpEffect.squish, 
                     this.bumpEffect.scale * this.bumpEffect.squish);
        }
        ctx.translate(-this.width/2, -this.height/2);

        // Corps principal
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.width/2, this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();

        // Yeux
        const eyeSize = this.width * 0.2;
        const eyeOffset = Math.sin(this.eyeAngle) * 2;

        // Expression choquée pendant la collision
        if (this.bumpEffect.active) {
            // Yeux plus grands et ronds
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.width * 0.3, this.height * 0.4 + eyeOffset, eyeSize * 1.2, 0, Math.PI * 2);
            ctx.arc(this.width * 0.7, this.height * 0.4 + eyeOffset, eyeSize * 1.2, 0, Math.PI * 2);
            ctx.fill();

            // Pupilles plus petites
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.width * 0.3, this.height * 0.4 + eyeOffset, eyeSize * 0.3, 0, Math.PI * 2);
            ctx.arc(this.width * 0.7, this.height * 0.4 + eyeOffset, eyeSize * 0.3, 0, Math.PI * 2);
            ctx.fill();

            // Bouche en O
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.width/2, this.height * 0.7, this.width * 0.15, 0, Math.PI * 2);
            ctx.stroke();
        } else {
            // Expression normale
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(this.width * 0.3, this.height * 0.4 + eyeOffset, eyeSize, 0, Math.PI * 2);
            ctx.arc(this.width * 0.7, this.height * 0.4 + eyeOffset, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(this.width * 0.3, this.height * 0.4 + eyeOffset, eyeSize * 0.5, 0, Math.PI * 2);
            ctx.arc(this.width * 0.7, this.height * 0.4 + eyeOffset, eyeSize * 0.5, 0, Math.PI * 2);
            ctx.fill();

            // Sourire normal
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.width/2, this.height * 0.6, this.width * 0.3, 0, Math.PI);
            ctx.stroke();
        }

        // Antennes qui réagissent à la collision
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        const antennaWiggle = this.bumpEffect.active ? Math.sin(Date.now() * 0.1) * 0.5 : 0;
        ctx.beginPath();
        ctx.moveTo(this.width * 0.3, this.height * 0.1);
        ctx.lineTo(this.width * 0.3 + antennaWiggle * 5, this.height * -0.1);
        ctx.moveTo(this.width * 0.7, this.height * 0.1);
        ctx.lineTo(this.width * 0.7 + antennaWiggle * 5, this.height * -0.1);
        ctx.stroke();

        ctx.restore();
    }

    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.bumpEffect.active = false;
        this.bumpEffect.scale = 1;
        this.bumpEffect.rotation = 0;
        this.bumpEffect.squish = 1;
    }
}