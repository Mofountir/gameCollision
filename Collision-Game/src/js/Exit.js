/**
 * Classe représentant la sortie
 */
class Exit extends ObjetGraphique {
    constructor(x, y) {
        super(x, y, 40, 40, '#ffd700');
        this.glowAngle = 0; // Angle pour l'effet de lueur
        this.particleTime = 0; // Temps pour la génération des particules
        this.particles = []; // particules qui sortent
    }

    // Méthode de mise à jour de l'objet graphique (appelée à chaque frame) 
    // pour animer la sortie et les particules qui sortent
    update() {
        this.glowAngle += 0.05; // Animation de l'effet de lueur
        this.particleTime += 0.1;   // Animation des particules qui sortent

        // Gestion des particules qui sortent
        if (Math.random() < 0.2) {
            this.particles.push({
                //On crée une particule à une position aléatoire
                x: this.x + this.width/2, 
                y: this.y + this.height/2, 

                //On lui donne une taille aléatoire
                size: Math.random() * 4 + 2,
                angle: Math.random() * Math.PI * 2,
                speed: Math.random() * 2 + 1,
                life: 1   
            });
        }

        // Mise à jour des particules qui sortent
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            // On déplace le monstre
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed;
            p.life -= 0.02;

            // Si la particule sort de la sortie, on le supprime
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.update();

        // Effet de lueur
        const glow = Math.abs(Math.sin(this.glowAngle)) * 20;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = glow;
        
        // Portail principal
        const gradient = ctx.createRadialGradient(
            // Dégradé de couleur pour le portail
            this.x + this.width/2, this.y + this.height/2, 0,
            this.x + this.width/2, this.y + this.height/2, this.width/2
        );
        gradient.addColorStop(0, '#ffd700');
        gradient.addColorStop(1, '#ff9f1a');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width/2, this.y + this.height/2, this.width/2, 0, Math.PI * 2);
        ctx.fill();

        // particules qui sortent
        ctx.shadowBlur = 0;
        this.particles.forEach(p => {
            ctx.fillStyle = `rgba(255, 215, 0, ${p.life})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Motif de spirale pour le portail
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < Math.PI * 2; i += Math.PI/8) {
            const radius = 15 * Math.sin(i + this.glowAngle);
            const x = this.x + this.width/2 + Math.cos(i) * radius;
            const y = this.y + this.height/2 + Math.sin(i) * radius;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
}