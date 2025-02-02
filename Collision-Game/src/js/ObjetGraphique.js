/**
 * Classe de base pour tous les objets graphiques du jeu
 */
class ObjetGraphique {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    /**
     * Dessine l'objet sur le canvas
     * @param {CanvasRenderingContext2D} ctx - Le contexte du canvas
     */
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    /**
     * Vérifie la collision avec un autre objet
     * @param {ObjetGraphique} other - L'autre objet à tester
     * @returns {boolean} - Vrai s'il y a collision
     */
    collidesWith(other) {
        return !(
            this.x + this.width < other.x ||
            other.x + other.width < this.x ||
            this.y + this.height < other.y ||
            other.y + other.height < this.y
        );
    }

    /**
     * Obtient les coordonnées et dimensions de l'objet
     */
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}