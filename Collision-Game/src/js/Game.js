/**
 * Classe principale du jeu
 */
class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        this.cellSize = 40;
        this.player = new Player(this.cellSize + 5, this.cellSize + 5);
        this.exit = new Exit(this.width - this.cellSize * 2, this.height - this.cellSize * 2);
        this.level = 1;
        this.walls = [];
        this.animatedObstacles = [];
        this.keys = {};
        
        this.isTransitioning = false;
        this.transitionAlpha = 0;
        this.transitionDirection = 1;
        this.showLevelMessage = false;
        this.confetti = [];

        this.setupEventListeners();
        this.initLevel();
    }

    // Gestion des événements clavier
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;    // Stocke la touche enfoncée
        });
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;   // Supprime la touche relâchée
        });
    }

    // Détection de collision entre deux rectangles
    getCollisionDirection(obj1, obj2) {
        // Calcul des distances entre les centres des deux rectangles
        const dx = (obj1.x + obj1.width/2) - (obj2.x + obj2.width/2);
        const dy = (obj1.y + obj1.height/2) - (obj2.y + obj2.height/2);

        // Calcul des demi-largeurs et demi-hauteurs des deux rectangles
        const width = (obj1.width + obj2.width) / 2;
        const height = (obj1.height + obj2.height) / 2;
        const crossWidth = width * dy;
        const crossHeight = height * dx;

        // si les distances sont inférieures aux demi-largeurs et demi-hauteurs, il y a collision
        if(Math.abs(dx) <= width && Math.abs(dy) <= height) {
            if(crossWidth > crossHeight) {
                return (crossWidth > (-crossHeight)) ? 'bottom' : 'left';
            } else {
                return (crossWidth > (-crossHeight)) ? 'right' : 'top';
            }
        }
        return null;
    }

    // version simplifiée de la détection de collision
    checkCollision(rect1, rect2) {
        return !(rect1.x + rect1.width < rect2.x ||
                rect2.x + rect2.width < rect1.x ||
                rect1.y + rect1.height < rect2.y ||
                rect2.y + rect2.height < rect1.y);
    }

    // Création d'un mur
    createWall(x, y, width = 1, height = 1) {
        this.walls.push(new Obstacle(
            x * this.cellSize, 
            y * this.cellSize, 
            width * this.cellSize, 
            height * this.cellSize
        ));
    }

    // Création d'un obstacle animé
    createAnimatedObstacle(x, y) {
        const speed = 2 + (this.level * 0.5);
        const direction = Math.random() < 0.5 ? 1 : -1; 
        const isHorizontal = Math.random() < 0.5;
        
        this.animatedObstacles.push(new ObstacleAnime(
            x * this.cellSize,
            y * this.cellSize,
            this.cellSize * 0.8,
            this.cellSize * 0.8,
            isHorizontal ? speed * direction : 0,
            isHorizontal ? 0 : speed * direction
        ));
    }

    // Génération du labyrinthe
    generateMaze() {
        // Bordures du labyrinthe
        for (let x = 0; x < this.width / this.cellSize; x++) {
            this.createWall(x, 0);
            this.createWall(x, this.height / this.cellSize - 1);
        }
        for (let y = 0; y < this.height / this.cellSize; y++) {
            this.createWall(0, y);
            this.createWall(this.width / this.cellSize - 1, y);
        }

        // Création des murs aléatoires
        // La densité des murs augmente avec le niveau
        // mais ne dépasse pas 30%
        const density = 0.15 + (this.level * 0.03);
        for (let x = 2; x < (this.width / this.cellSize) - 2; x++) {
            for (let y = 2; y < (this.height / this.cellSize) - 2; y++) {
                if (Math.random() < density) {
                    const size = Math.random() < 0.3 ? 2 : 1;
                    if (!this.isAreaBlocked(x, y, size, size, 
                        {x: Math.floor(this.player.x / this.cellSize), y: Math.floor(this.player.y / this.cellSize)},
                        {x: Math.floor(this.exit.x / this.cellSize), y: Math.floor(this.exit.y / this.cellSize)})) {
                        this.createWall(x, y, size, size);
                    }
                }
            }
        }

        // Ajout des obstacles animés
        // Le nombre d'obstacles augmente avec le niveau
        // mais ne dépasse pas 10
        const numAnimatedObstacles = Math.min(3 + this.level, 10);
        for (let i = 0; i < numAnimatedObstacles; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (this.width / this.cellSize - 4)) + 2;
                y = Math.floor(Math.random() * (this.height / this.cellSize - 4)) + 2;
            } while (this.isPositionOccupied(x, y));
            
            this.createAnimatedObstacle(x, y);
        }
    }

    // Vérifie si une zone est bloquée par le joueur ou la sortie
    // pour éviter de bloquer le passage du joueur
    // ou de bloquer la sortie
    //  ou de bloquer un autre obstacle
    isAreaBlocked(x, y, width, height, playerArea, exitArea) {
        for (let dx = 0; dx < width; dx++) {
            for (let dy = 0; dy < height; dy++) {
                const checkX = x + dx;
                const checkY = y + dy;
                
                if (Math.abs(checkX - playerArea.x) < 2 && Math.abs(checkY - playerArea.y) < 2) return true;
                if (Math.abs(checkX - exitArea.x) < 2 && Math.abs(checkY - exitArea.y) < 2) return true;
            }
        }
        return false;
    }

    // Vérifie si une position est occupée par un mur ou un obstacle
    // pour éviter de bloquer le joueur
    // ou de bloquer la sortie
    // ou de bloquer un autre obstacle
    isPositionOccupied(x, y) {
        const testRect = {
            x: x * this.cellSize,
            y: y * this.cellSize,
            width: this.cellSize,
            height: this.cellSize
        };

        return this.walls.some(wall => this.checkCollision(testRect, wall)) ||
               this.animatedObstacles.some(obstacle => this.checkCollision(testRect, obstacle));
    }

    // Initialisation du niveau
    // Réinitialise les murs, obstacles et joueur
    // Génère un nouveau labyrinthe
    initLevel() {
        this.walls = [];
        this.animatedObstacles = [];
        this.confetti = [];
        this.generateMaze();
        this.player.reset();
    }

    // Transition de niveau
    // Affiche un message de niveau et ajoute des confettis
    // pour célébrer le passage au niveau suivant
    startLevelTransition() {
        this.isTransitioning = true;
        this.transitionAlpha = 0;
        this.transitionDirection = 1;
        this.showLevelMessage = false;
        this.addConfetti(this.player.x, this.player.y);
    }


    // Ajout de confettis à une position donnée
    // pour célébrer le passage au niveau suivant
    // Les confettis sont des rectangles colorés qui tombent
    addConfetti(x, y) {
        for (let i = 0; i < 50; i++) {
            this.confetti.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                color: `hsl(${Math.random() * 360}, 100%, 50%)`,
                rotation: Math.random() * Math.PI * 2,
                size: Math.random() * 10 + 5
            });
        }
    }

    // Mise à jour des confettis
    // Les confettis tombent et tournent
    updateConfetti() {
        for (let i = this.confetti.length - 1; i >= 0; i--) {
            const conf = this.confetti[i];
            conf.x += conf.vx;
            conf.y += conf.vy;
            conf.vy += 0.2;
            conf.rotation += 0.1;
            
            if (conf.y > this.height) {
                this.confetti.splice(i, 1);
            }
        }
    }

    // Dessine les confettis
    drawConfetti() {
        this.confetti.forEach(conf => {
            this.ctx.save();
            this.ctx.translate(conf.x, conf.y);
            this.ctx.rotate(conf.rotation);
            this.ctx.fillStyle = conf.color;
            this.ctx.fillRect(-conf.size/2, -conf.size/2, conf.size, conf.size);
            this.ctx.restore();
        });
    }

    // Mise à jour du jeu
    update() {
        if (this.isTransitioning) {
            this.transitionAlpha += 0.02 * this.transitionDirection;
            
            if (this.transitionAlpha >= 1) {
                if (!this.showLevelMessage) {
                    this.showLevelMessage = true;
                    this.transitionDirection = -1;
                    this.level++;
                    this.initLevel();
                    setTimeout(() => {
                        this.transitionDirection = -1;
                    }, 1000);
                }
            } else if (this.transitionAlpha <= 0 && this.transitionDirection === -1) {
                this.isTransitioning = false;
                this.showLevelMessage = false;
            }
            return;
        }

        
        this.updateConfetti();
        this.animatedObstacles.forEach(obstacle => obstacle.update());

        let newX = this.player.x;
        let newY = this.player.y;
        
        if (this.keys.ArrowLeft) newX -= this.player.speed;
        if (this.keys.ArrowRight) newX += this.player.speed;
        if (this.keys.ArrowUp) newY -= this.player.speed;
        if (this.keys.ArrowDown) newY += this.player.speed;


        const newPos = { x: newX, y: newY, width: this.player.width, height: this.player.height };
        let canMoveX = true;
        let canMoveY = true;

        // Vérifie les collisions avec les murs
        for (const wall of this.walls) {
            if (this.checkCollision(newPos, wall)) {
                const direction = this.getCollisionDirection(this.player, wall);
                if (direction === 'left' || direction === 'right') canMoveX = false;
                if (direction === 'top' || direction === 'bottom') canMoveY = false;
                this.player.triggerBumpEffect();
            }
        }
        // Vérifie les collisions avec les obstacles animés
        for (const obstacle of this.animatedObstacles) {
            if (this.checkCollision(newPos, obstacle)) {
                this.player.triggerBumpEffect();
                this.player.reset();
                return;
            }
        }
        // Vérifie les collisions avec les bords du canvas
        if (canMoveX) this.player.x = newX;

        // Vérifie les collisions avec les bords du canvas
        if (canMoveY) this.player.y = newY;

        // Vérifie si le joueur atteint la sortie
        if (this.player.collidesWith(this.exit)) {
            this.startLevelTransition();
        }
    }

    draw() {
        // Fond avec motif amusant
        this.ctx.fillStyle = '#16213e';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Motif de fond
        this.ctx.strokeStyle = '#1a2649';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < this.width; i += 40) {
            for (let j = 0; j < this.height; j += 40) {
                this.ctx.beginPath();
                this.ctx.arc(i, j, 2, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }

        this.exit.draw(this.ctx);
        this.walls.forEach(wall => wall.draw(this.ctx));
        this.animatedObstacles.forEach(obstacle => obstacle.draw(this.ctx));
        this.player.draw(this.ctx);
        this.drawConfetti();

        // Interface utilisateur
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`Niveau ${this.level}`, 10, 30);

        if (this.isTransitioning) {
            this.ctx.fillStyle = `rgba(0, 0, 0, ${this.transitionAlpha})`;
            this.ctx.fillRect(0, 0, this.width, this.height);

            if (this.showLevelMessage) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 40px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`Niveau ${this.level}`, this.width / 2, this.height / 2);
                this.ctx.font = '24px Arial';
                this.ctx.fillText('Préparez-vous !', this.width / 2, this.height / 2 + 50);
                this.ctx.textAlign = 'left';
            }
        }
    }

    // Boucle de jeu
    // Appelée à chaque rafraîchissement de l'écran
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    // Démarrage du jeu
    start() {
        this.gameLoop();
    }
}