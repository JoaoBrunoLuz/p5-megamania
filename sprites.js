// sprites.js - Gerenciador de Assets HD com suporte a imagens múltiplas

const spriteSheet = new Image();
spriteSheet.src = 'assets.png';

const playerImage = new Image();
playerImage.src = 'player.png';

let assetsLoaded = 0;
const totalAssets = 2;

function checkLoading() {
    assetsLoaded++;
    if (assetsLoaded >= totalAssets) {
        console.log("Todos os Assets HD carregados!");
    }
}

spriteSheet.onload = checkLoading;
playerImage.onload = checkLoading;

const SPRITE_MAP = {
    player: null, // Especial: usa playerImage
    enemy_purple: [50, 50, 150, 150],
    enemy_green: [250, 50, 180, 180],
    enemy_crab: [50, 200, 80, 80],
    enemy_squid: [200, 200, 80, 80],
    projectile_player: [50, 600, 20, 40],
    projectile_enemy: [100, 600, 30, 30],
    explosion: [400, 600, 150, 150],
    thruster: [150, 550, 40, 40],
    icon_laser: [400, 50, 50, 50],
    icon_rapid: [400, 120, 50, 50],
    icon_energy: [400, 190, 50, 50]
};

const LEVEL_SPRITE_KEYS = ['enemy_purple', 'enemy_crab', 'enemy_squid', 'enemy_green'];

function drawSpriteHD(ctx, spriteKey, destX, destY, destW, destH) {
    if (assetsLoaded < totalAssets) return;
    
    if (spriteKey === 'player') {
        ctx.drawImage(playerImage, destX, destY, destW, destH);
        return;
    }

    const coords = SPRITE_MAP[spriteKey];
    if (!coords) return;

    ctx.drawImage(
        spriteSheet,
        coords[0], coords[1], coords[2], coords[3],
        destX, destY, destW, destH
    );
}

function areAssetsReady() {
    return assetsLoaded >= totalAssets;
}
