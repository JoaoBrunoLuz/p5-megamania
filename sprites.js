// sprites.js - Gerenciador de Assets de alta fidelidade (Spritesheet)

const spriteSheet = new Image();
spriteSheet.src = 'assets.png';

let assetsLoaded = false;
spriteSheet.onload = () => {
    assetsLoaded = true;
    console.log("Assets HD carregados!");
};

// Coordenadas estimadas (precisarão de ajustes finos)
// Formato: [x, y, width, height]
const SPRITE_MAP = {
    player: [380, 780, 180, 180], // Tentativa de capturar a nave ciano detalhada no centro-baixo
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

// Mapeamento dos níveis para os novos sprites
const LEVEL_SPRITE_KEYS = [
    'enemy_purple',
    'enemy_crab',
    'enemy_squid',
    'enemy_green',
    'enemy_purple' // Repete ou alterna
];

function drawSpriteHD(ctx, spriteKey, destX, destY, destW, destH) {
    if (!assetsLoaded) return;
    
    const coords = SPRITE_MAP[spriteKey];
    if (!coords) return;

    ctx.drawImage(
        spriteSheet,
        coords[0], coords[1], coords[2], coords[3], // Fonte (Crop)
        destX, destY, destW, destH // Destino (Canvas)
    );
}

// Helper para obter proporção original
function getSpriteAspectRatio(spriteKey) {
    const coords = SPRITE_MAP[spriteKey];
    if (!coords) return 1;
    return coords[2] / coords[3];
}
