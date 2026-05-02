// game.js - Lógica principal do Jogo HD

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configurações Globais
const SCALE = 1; // Usando escala direta dos assets HD
const FPS = 60;

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
        resumeAudioContext();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.ArrowLeft = false;
    if (e.code === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.ArrowRight = false;
    if (e.code === 'Space') keys.Space = false;
});

// Classe para Fundo Parallax
class ParallaxLayer {
    constructor(speed, count, color) {
        this.speed = speed;
        this.stars = [];
        for (let i = 0; i < count; i++) {
            this.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1
            });
        }
        this.color = color;
    }

    update() {
        this.stars.forEach(s => {
            s.y += this.speed;
            if (s.y > canvas.height) {
                s.y = -10;
                s.x = Math.random() * canvas.width;
            }
        });
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        this.stars.forEach(s => {
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });
    }
}

// Classes de Entidades
class Player {
    constructor() {
        this.spriteKey = 'player';
        this.width = 64; // Tamanho de destino
        this.height = 64;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 60;
        this.speed = 6;
        this.shootCooldown = 0;
        this.shootDelay = 12;
    }

    update() {
        if (keys.ArrowLeft) this.x -= this.speed;
        if (keys.ArrowRight) this.x += this.speed;

        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;

        if (this.shootCooldown > 0) this.shootCooldown--;

        if (keys.Space && this.shootCooldown === 0) {
            this.shoot();
            this.shootCooldown = this.shootDelay;
        }
    }

    shoot() {
        game.projectiles.push(new Projectile(this.x + this.width / 2 - 10, this.y, -12, false, '#00FFFF', 'projectile_player'));
        playShootSound();
    }

    draw(ctx) {
        // Brilho Neon na Nave
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00FFFF';
        drawSpriteHD(ctx, this.spriteKey, this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}

class Enemy {
    constructor(x, y, spriteKey, speedMultiplier) {
        this.spriteKey = spriteKey;
        this.width = 50;
        this.height = 50;
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.timer = Math.random() * Math.PI * 2;
        this.speedY = 0.6 * speedMultiplier;
        this.zigzagSpeed = 0.04 * speedMultiplier;
        this.zigzagAmplitude = 40;
        this.shootChance = 0.001 * speedMultiplier;
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
        game.projectiles.push(new Projectile(this.x + this.width / 2 - 10, this.y + this.height, 3, true, '#FFA500', 'projectile_enemy'));
        playEnemyShootSound();
    }

    draw(ctx) {
        drawSpriteHD(ctx, this.spriteKey, this.x, this.y, this.width, this.height);
    }
}

class Projectile {
    constructor(x, y, velocityY, isEnemy, color, spriteKey) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 30;
        this.velocityY = velocityY;
        this.isEnemy = isEnemy;
        this.color = color;
        this.spriteKey = spriteKey;
        this.markedForDeletion = false;
    }

    update() {
        this.y += this.velocityY;
        if (this.y < -50 || this.y > canvas.height + 50) {
            this.markedForDeletion = true;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        drawSpriteHD(ctx, this.spriteKey, this.x, this.y, this.width, this.height);
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 1.0;
        this.color = color;
        this.size = Math.random() * 5 + 2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.04;
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
    LOADING: -1,
    MENU: 0,
    PLAYING: 1,
    TRANSITION: 2,
    GAME_OVER: 3
};

class Game {
    constructor() {
        this.parallax = [
            new ParallaxLayer(0.2, 50, '#333'),
            new ParallaxLayer(0.5, 30, '#555'),
            new ParallaxLayer(1.5, 10, '#888')
        ];
        this.reset();
        this.state = GAME_STATES.LOADING;
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
        this.energyDepletionRate = 0.04;
    }

    spawnWave() {
        this.enemies = [];
        this.projectiles = [];
        const spriteKey = LEVEL_SPRITE_KEYS[(this.level - 1) % LEVEL_SPRITE_KEYS.length];
        const speedMultiplier = 1 + (this.level * 0.15);
        
        const rows = 4;
        const cols = 7;
        const spacingX = 75;
        const spacingY = 60;
        const startX = 60;
        const startY = -300;
        
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                this.enemies.push(new Enemy(startX + c * spacingX, startY + r * spacingY, spriteKey, speedMultiplier));
            }
        }
        this.energy = this.maxEnergy;
    }

    createExplosion(x, y, color) {
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(x, y, color));
        }
        playExplosionSound();
    }

    checkCollisions() {
        const collides = (a, b) => {
            return a.x < b.x + b.width - 5 &&
                   a.x + a.width - 5 > b.x &&
                   a.y < b.y + b.height - 5 &&
                   a.y + a.height - 5 > b.y;
        };

        this.projectiles.forEach(p => {
            if (p.isEnemy) {
                if (collides(p, this.player)) {
                    p.markedForDeletion = true;
                    this.loseLife();
                }
            } else {
                this.enemies.forEach(e => {
                    if (collides(p, e)) {
                        p.markedForDeletion = true;
                        e.markedForDeletion = true;
                        this.score += 25 * this.level;
                        this.createExplosion(e.x + e.width/2, e.y + e.height/2, '#FFD700');
                    }
                });
            }
        });

        this.enemies.forEach(e => {
            if (collides(e, this.player)) {
                e.markedForDeletion = true;
                this.loseLife();
            }
            if (e.y > canvas.height) e.markedForDeletion = true;
        });

        this.enemies = this.enemies.filter(e => !e.markedForDeletion);
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion);
    }

    loseLife() {
        this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#00FFFF');
        this.lives--;
        if (this.lives <= 0) {
            this.state = GAME_STATES.GAME_OVER;
        } else {
            this.player = new Player();
            this.projectiles = this.projectiles.filter(p => !p.isEnemy);
        }
    }

    update() {
        if (this.state === GAME_STATES.LOADING) {
            if (assetsLoaded) this.state = GAME_STATES.MENU;
            return;
        }

        this.parallax.forEach(l => l.update());

        if (this.state !== GAME_STATES.PLAYING) return;

        this.player.update();
        this.projectiles.forEach(p => p.update());
        this.enemies.forEach(e => e.update());
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => p.life > 0);

        this.checkCollisions();

        this.energy -= this.energyDepletionRate;
        if (this.energy <= 0) {
            this.energy = 0;
            this.loseLife();
            if (this.lives > 0) {
                this.energy = this.maxEnergy;
                playEnergyLowSound();
            }
        }

        if (this.enemies.length === 0 && this.state === GAME_STATES.PLAYING) {
            this.state = GAME_STATES.TRANSITION;
            setTimeout(() => {
                this.level++;
                this.spawnWave();
                this.state = GAME_STATES.PLAYING;
            }, 2500);
        }
    }

    draw() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Parallax sempre visível
        this.parallax.forEach(l => l.draw(ctx));

        if (this.state === GAME_STATES.LOADING) {
            ctx.fillStyle = '#FFF';
            ctx.font = '20px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('LOADING ASSETS...', canvas.width/2, canvas.height/2);
            return;
        }

        if (this.state === GAME_STATES.MENU) {
            ctx.fillStyle = '#00FFFF';
            ctx.font = '28px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('MEGAMANIA HD', canvas.width/2, canvas.height/2 - 50);
            
            ctx.fillStyle = '#FFF';
            ctx.font = '12px "Press Start 2P"';
            ctx.fillText('PRESS SPACE TO START', canvas.width/2, canvas.height/2 + 20);
            
            // Desenhar prévia da nave
            drawSpriteHD(ctx, 'player', canvas.width/2 - 40, canvas.height/2 + 60, 80, 80);
            
            if (keys.Space) {
                this.reset();
                this.spawnWave();
                this.state = GAME_STATES.PLAYING;
                keys.Space = false;
            }
            return;
        }

        if (this.state === GAME_STATES.GAME_OVER) {
            ctx.fillStyle = '#FF0000';
            ctx.font = '36px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
            ctx.fillStyle = '#FFF';
            ctx.font = '14px "Press Start 2P"';
            ctx.fillText(`SCORE: ${this.score}`, canvas.width/2, canvas.height/2 + 50);
            ctx.fillText('PRESS SPACE FOR MENU', canvas.width/2, canvas.height/2 + 90);
            if (keys.Space) {
                this.state = GAME_STATES.MENU;
                keys.Space = false;
            }
            return;
        }

        this.player.draw(ctx);
        this.projectiles.forEach(p => p.draw(ctx));
        this.enemies.forEach(e => e.draw(ctx));
        this.particles.forEach(p => p.draw(ctx));

        // HUD Moderno
        this.drawHUD();

        if (this.state === GAME_STATES.TRANSITION) {
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#FFD700';
            ctx.font = '24px "Press Start 2P"';
            ctx.textAlign = 'center';
            ctx.fillText(`LEVEL CLEARED!`, canvas.width/2, canvas.height/2);
            ctx.fillStyle = '#FFF';
            ctx.font = '12px "Press Start 2P"';
            ctx.fillText(`PREPARING LEVEL ${this.level + 1}`, canvas.width/2, canvas.height/2 + 40);
        }
    }

    drawHUD() {
        // Top Bar
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, canvas.width, 50);
        ctx.fillStyle = '#00FFFF';
        ctx.font = '18px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${this.score.toString().padStart(6, '0')}`, 20, 35);
        
        ctx.textAlign = 'right';
        ctx.fillText(`LVL ${this.level}`, canvas.width - 20, 35);

        // Bottom Bar
        ctx.fillStyle = '#111';
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        
        ctx.fillStyle = '#FFF';
        ctx.font = '10px "Press Start 2P"';
        ctx.textAlign = 'left';
        ctx.fillText(`SHIPS: ${this.lives}`, 20, canvas.height - 15);

        // Energy Bar (Retro-LED style)
        ctx.fillText('FUEL:', canvas.width/2 - 80, canvas.height - 15);
        const barWidth = 160;
        const ratio = this.energy / this.maxEnergy;
        
        ctx.strokeStyle = '#444';
        ctx.strokeRect(canvas.width/2 - 20, canvas.height - 28, barWidth, 18);
        
        // Segments
        const segmentCount = 10;
        const segmentWidth = (barWidth - 4) / segmentCount;
        for (let i = 0; i < segmentCount; i++) {
            if (ratio > (i / segmentCount)) {
                if (i < 3) ctx.fillStyle = '#FF0000';
                else if (i < 6) ctx.fillStyle = '#FFFF00';
                else ctx.fillStyle = '#00FF00';
                ctx.fillRect(canvas.width/2 - 18 + (i * segmentWidth), canvas.height - 26, segmentWidth - 2, 14);
            }
        }
    }
}

const game = new Game();
function gameLoop() {
    game.update();
    game.draw();
    requestAnimationFrame(gameLoop);
}
gameLoop();
