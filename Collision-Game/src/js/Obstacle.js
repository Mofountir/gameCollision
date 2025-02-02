/**
 * Classe représentant un obstacle statique
 */
class Obstacle extends ObjetGraphique {
    constructor(x, y, width, height) {
        super(x, y, width, height, '#ff6b6b');
    }

    draw(ctx) {
        // Effet de mur avec dégradé et ombre
        const gradient = ctx.createLinearGradient(
            this.x, this.y,
            this.x, this.y + this.height
        );
        gradient.addColorStop(0, '#ff8585');
        gradient.addColorStop(0.5, '#ff6b6b');
        gradient.addColorStop(1, '#ff5252');

        // Ombre portée
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Rectangle principal
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, this.y, this.width, this.height);

        // Effet de brique
        ctx.shadowColor = 'transparent';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;

        // Lignes horizontales
        for (let y = 0; y < this.height; y += 10) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + y);
            ctx.lineTo(this.x + this.width, this.y + y);
            ctx.stroke();
        }

        // Lignes verticales décalées
        for (let x = 0; x < this.width; x += 20) {
            const offset = (Math.floor((this.y % 20) / 10)) * 10;
            ctx.beginPath();
            ctx.moveTo(this.x + x, this.y);
            ctx.lineTo(this.x + x, this.y + this.height);
            ctx.stroke();
        }

        // Réinitialisation des effets d'ombre
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }
}