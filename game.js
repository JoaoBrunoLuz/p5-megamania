// game.js - Lógica principal do Jogo

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configurações Globais
const SCALE = 4;
const FPS = 60;

// Tipos de Inimigos por Nível
const LEVEL_ENEMIES = ['hamburger', 'cookie', 'iron', 'bowtie', 'diamond'];

// Estado do Teclado
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.ArrowLeft = true;
    if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.ArrowRight = true;
    if (e.code === 'Space') {
        keys.Space = true;
        // Iniciar áudio na primeira interação
        resumeAudioContext();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.ArrowLeft = false;
    if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.ArrowRight = false;
    if (e.code === 'Space') keys.Space = false;
});

// Classes
class Player {
    constructor() {
        const dim = getSpriteDimensions('player', SCALE);
        this.width = dim.width;
        this.height = dim.height;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 40; // 40px acima do fundo HUD
        this.speed = 5;
        this.shootCooldown = 0;
        this.shootDelay = 15; // frames
    }

    update() {
        if (keys.ArrowLeft) this.x -= this.speed;
        if (keys.ArrowRight) this.x += this.speed;

        // Limites da tela
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;

        if (this.shootCooldown > 0) this.shootCooldown--;

        if (keys.Space && this.shootCooldown === 0) {
            this.shoot();
            this.shootCooldown = this.shootDelay;
        }
    }

    shoot() {
        game.projectiles.push(new Projectile(this.x + this.width / 2 - 2, this.y, -10, false, '#00FFFF'));
        playShootSound();
    }

    draw(ctx) {
        drawSprite(ctx, 'player', this.x, this.y, SCALE);
    }
}

class Enemy {
    constructor(x, y, type, speedMultiplier) {
        this.type = type;
        const dim = getSpriteDimensions(type, SCALE);
        this.width = dim.width;
        this.height = dim.height;
        this.x = x;
        this.y = y;
        
        this.baseX = x;
        this.timer = Math.random() * Math.PI * 2; // Offset para o seno
        
        this.speedY = 0.5 * speedMultiplier;
        this.zigzagSpeed = 0.05 * speedMultiplier;
        this.zigzagAmplitude = 30;
        
        this.shootChance = 0.005 * speedMultiplier; // chance por frame
    }

    update() {
        this.y += this.speedY;
        this.timer += this.zigzagSpeed;
        this.x = this.baseX + Math.sin(this.timer) * this.zigzagAmplitude;

        if (Math.random() < this.shootChance) {
            this.shoot();
        }
    }

    shoot() {
        game.projectiles.push(new Projectile(this.x + this.width / 2 - 2, this.y + this.height, 2, true, SPRITES[this.type].color));
        playEnemyShootSound();
    }

    draw(ctx) {
        drawSprite(ctx, this.type, this.x, this.y, SCALE);
    }
}

class Projectile {
    constructor(x, y, velocityY, isEnemy, color) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 12;
        this.velocityY = velocityY;
        this.isEnemy = isEnemy;
        this.color = color;
        this.markedForDeletion = false;
    }

    update() {
        this.y += this.velocityY;
        if (this.y < 0 || this.y > canvas.height) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 1.0;
        this.color = color;
        this.size = Math.random() * 4 + 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.05;
    }

    draw(ctx) {
        ctx.globalAlpha = Math.max(0, this.life);
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1.0;
    }
}

// Gerenciador do Jogo
const GAME_STATES = {
    MENU: 0,
    PLAYING: 1,
    TRANSITION: 2,
    GAME_OVER: 3
};

class Game {
    constructor() {
        this.reset();
        this.state = GAME_STATES.MENU;
    }

    reset() {
        this.player = new Player();
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.energy = 100;
        this.maxEnergy = 100;
        this.energyDepletionRate = 0.05; // Por frame
    }

    spawnWave() {
        this.enemies = [];
        this.projectiles = []; // Limpa tiros ao mudar fase
        const enemyType = LEVEL_ENEMIES[(this.level - 1) % LEVEL_ENEMIES.length];
        const speedMultiplier = 1 + (this.level * 0.2);
        
        const rows = 4;
        const cols = 8;
        const spacingX = 60;
        const spacingY = 50;
        const startX = 60;
        const startY = -200; // Começa fora da tela e desce
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.enemies.push(new Enemy(startX + c * spacingX, startY + r * spacingY, enemyType, speedMultiplier));
            }
        }
        this.energy = this.maxEnergy; // Renova energia
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 15; i++) {
            this.particles.push(new Particle(x, y, color));
        }
        playExplosionSound();
    }

    checkCollisions() {
        // AABB Collision function
        const collides = (a, b) => {
            return a.x < b.x + b.width &&
                   a.x + a.width > b.x &&
                   a.y < b.y + b.height &&
                   a.y + a.height > b.y;
        };

        // Projéteis
        this.projectiles.forEach(p => {
            if (p.isEnemy) {
                // Tiro Inimigo -> Player
                if (collides(p, this.player)) {
                    p.markedForDeletion = true;
                    this.loseLife();
                }
            } else {
                // Tiro Player -> Inimigo
                this.enemies.forEach(e => {
                    if (collides(p, e)) {
                        p.markedForDeletion = true;
                        e.markedForDeletion = true;
                        this.score += 10 * this.level;
                        this.createExplosion(e.x + e.width/2, e.y + e.height/2, SPRITES[e.type].color);
                    }
                });
            }
        });

        // Inimigo -> Player (Colisão Direta)
        this.enemies.forEach(e => {
            if (collides(e, this.player)) {
                e.markedForDeletion = true;
                this.loseLife();
            }
            // Inimigo passou da tela (se chegar ao fundo, talvez perca vida ou só suma)
            if (e.y > canvas.height) {
                 e.markedForDeletion = true;
            }
        });

        // Limpeza de arrays
        this.enemies = this.enemies.filter(e => !e.markedForDeletion);
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
    }

    loseLife() {
        this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, SPRITES.player.color);
        this.lives--;
        if (this.lives <= 0) {
            this.state = GAME_STATES.GAME_OVER;
        } else {
            // Reposiciona player
            this.player = new Player();
            // Limpa tiros inimigos para não morrer logo em seguida
            this.projectiles = this.projectiles.filter(p => !p.isEnemy);
        }
    }

    update() {
        if (this.state !== GAME_STATES.PLAYING) return;

        this.player.update();
        this.projectiles.forEach(p => p.update());
        this.enemies.forEach(e => e.update());
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.life > 0);

        this.checkCollisions();

        // Energia
        this.energy -= this.energyDepletionRate;
        if (this.energy <= 0) {
            this.energy = 0;
            this.loseLife();
            if (this.lives > 0) {
                this.energy = this.maxEnergy;
                playEnergyLowSound();
            }
        }

        // Progresso de Nível
        if (this.enemies.length === 0) {
            this.state = GAME_STATES.TRANSITION;
            setTimeout(() => {
                this.level++;
                this.spawnWave();
                this.state = GAME_STATES.PLAYING;
            }, 2000);
        }
    }

    draw() {
        // Limpar tela
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (this.state === GAME_STATES.MENU) {
            ctx.fillStyle = '#00FFFF';
            ctx.font = '30px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('MEGAMANIA CLONE', canvas.width/2, canvas.height/2 - 50);
            
            ctx.fillStyle = '#FFF';
            ctx.font = '14px "Press Start 2P"';
            ctx.fillText('Pressione ESPAÇO para Iniciar', canvas.width/2, canvas.height/2 + 20);
            ctx.fillText('Setas para mover, Espaço para atirar', canvas.width/2, canvas.height/2 + 60);
            
            if (keys.Space) {
                this.reset();
                this.spawnWave();
                this.state = GAME_STATES.PLAYING;
                keys.Space = false; // Prevent immediate shooting
            }
            return;
        }

        if (this.state === GAME_STATES.GAME_OVER) {
            ctx.fillStyle = '#FF0000';
            ctx.font = '40px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
            
            ctx.fillStyle = '#FFF';
            ctx.font = '14px "Press Start 2P"';
            ctx.fillText(`Score: ${this.score}`, canvas.width/2, canvas.height/2 + 40);
            ctx.fillText('Pressione ESPAÇO para Menu', canvas.width/2, canvas.height/2 + 80);
            
            if (keys.Space) {
                this.state = GAME_STATES.MENU;
                keys.Space = false;
            }
            return;
        }

        // Desenhar Elementos do Jogo
        this.player.draw(ctx);
        this.projectiles.forEach(p => p.draw(ctx));
        this.enemies.forEach(e => e.draw(ctx));
        this.particles.forEach(p => p.draw(ctx));

        // HUD - Score
        ctx.fillStyle = '#FFF';
        ctx.font = '20px "Press Start 2P"';
        ctx.textAlign = 'center';
        ctx.fillText(this.score.toString().padStart(6, '0'), canvas.width/2, 30);

        // HUD - Bottom Bar (Energia e Vidas)
        ctx.fillStyle = '#222';
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
        
        // Vidas
        ctx.fillStyle = '#FFF';
        ctx.font = '12px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText(`LIVES: ${this.lives}`, 10, canvas.height - 10);

        // Barra de Energia
        ctx.fillText('ENERGY:', canvas.width/2 - 60, canvas.height - 10);
        
        const energyBarWidth = 150;
        const energyRatio = this.energy / this.maxEnergy;
        ctx.strokeStyle = '#FFF';
        ctx.strokeRect(canvas.width/2 + 30, canvas.height - 22, energyBarWidth, 14);
        
        // Cor da energia muda se estiver acabando
        ctx.fillStyle = energyRatio > 0.3 ? '#00FF00' : '#FF0000';
        ctx.fillRect(canvas.width/2 + 32, canvas.height - 20, (energyBarWidth - 4) * energyRatio, 10);

        // Mensagem de Transição
        if (this.state === GAME_STATES.TRANSITION) {
            ctx.fillStyle = '#FF00FF';
            ctx.font = '30px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(`LEVEL CLEARED!`, canvas.width/2, canvas.height/2);
            ctx.fillStyle = '#FFF';
            ctx.font = '16px "Press Start 2P"';
            ctx.fillText(`Get Ready for Level ${this.level + 1}`, canvas.width/2, canvas.height/2 + 40);
        }
    }
}

// Instância e Loop
const game = new Game();

function gameLoop() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}

// Iniciar
gameLoop();
