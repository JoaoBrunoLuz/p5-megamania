// audio.js - Sintetizador de efeitos sonoros 8-bit usando Web Audio API

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playShootSound() {
    if (audioCtx.state === 'suspended') return;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'square';
    
    // Sweep de frequência (som agudo rápido descendo)
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.1);
    
    // Envelope de volume
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function playEnemyShootSound() {
    if (audioCtx.state === 'suspended') return;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sawtooth';
    
    osc.frequency.setValueAtTime(400, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
}

function playExplosionSound() {
    if (audioCtx.state === 'suspended') return;
    
    const bufferSize = audioCtx.sampleRate * 0.2; // 0.2 segundos de ruído
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // Ruído branco
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    // Filtro para deixar o som mais "abafado/crushing"
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, audioCtx.currentTime);
    filter.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.2);
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
    
    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    noise.start();
}

function playEnergyLowSound() {
    if (audioCtx.state === 'suspended') return;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(200, audioCtx.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);
}

function resumeAudioContext() {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}
