// sprites.js - Matrizes de Pixel Art para renderização (1 = preenchido, 0 = vazio)

const SPRITES = {
    player: {
        color: '#00FFFF', // Ciano
        data: [
            [0,0,0,1,0,0,0],
            [0,0,1,1,1,0,0],
            [0,1,1,1,1,1,0],
            [1,1,0,1,0,1,1],
            [1,0,0,1,0,0,1]
        ]
    },
    // Nível 1
    hamburger: {
        color: '#FFA500', // Laranja
        data: [
            [0,0,1,1,1,1,0,0],
            [0,1,1,1,1,1,1,0],
            [1,1,0,0,0,0,1,1], // semente
            [0,1,1,1,1,1,1,0],
            [1,1,1,1,1,1,1,1], // carne
            [0,1,1,1,1,1,1,0]
        ]
    },
    // Nível 2
    cookie: {
        color: '#DEB887', // Burlywood
        data: [
            [0,1,1,1,1,1,0],
            [1,1,0,1,1,1,1],
            [1,1,1,1,0,1,1],
            [1,0,1,1,1,1,1],
            [1,1,1,0,1,1,1],
            [0,1,1,1,1,1,0]
        ]
    },
    // Nível 3
    iron: {
        color: '#C0C0C0', // Prata
        data: [
            [0,0,1,1,1,0,0],
            [0,0,1,0,1,0,0],
            [0,1,1,1,1,1,0],
            [1,1,1,1,1,1,1],
            [1,1,1,1,1,1,1]
        ]
    },
    // Nível 4
    bowtie: {
        color: '#FF00FF', // Magenta
        data: [
            [1,1,0,0,0,1,1],
            [1,1,1,0,1,1,1],
            [1,1,1,1,1,1,1],
            [1,1,1,0,1,1,1],
            [1,1,0,0,0,1,1]
        ]
    },
    // Nível 5
    diamond: {
        color: '#00FF00', // Verde
        data: [
            [0,0,0,1,0,0,0],
            [0,0,1,1,1,0,0],
            [0,1,1,1,1,1,0],
            [1,1,1,1,1,1,1],
            [0,1,1,1,1,1,0],
            [0,0,1,1,1,0,0],
            [0,0,0,1,0,0,0]
        ]
    }
};

function drawSprite(ctx, spriteKey, x, y, scale = 4) {
    const sprite = SPRITES[spriteKey];
    if (!sprite) return;
    
    ctx.fillStyle = sprite.color;
    for (let row = 0; row < sprite.data.length; row++) {
        for (let col = 0; col < sprite.data[row].length; col++) {
            if (sprite.data[row][col] === 1) {
                ctx.fillRect(x + (col * scale), y + (row * scale), scale, scale);
            }
        }
    }
}

function getSpriteDimensions(spriteKey, scale = 4) {
    const sprite = SPRITES[spriteKey];
    if (!sprite) return { width: 0, height: 0 };
    return {
        width: sprite.data[0].length * scale,
        height: sprite.data.length * scale
    };
}
