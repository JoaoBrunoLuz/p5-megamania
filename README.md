# Megamania Remake - HTML5 Canvas 🚀

Um remake fiel e moderno do clássico "Megamania" do Atari, desenvolvido inteiramente com tecnologias web puras (Vanilla JS) e renderização via Canvas API.

![Status do Projeto](https://img.shields.io/badge/Status-Conclu%C3%ADdo-brightgreen)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue)

## 🎮 Sobre o Jogo

Este projeto é uma releitura do lendário *shoot 'em up* de tela fixa. O jogador controla uma nave na parte inferior da tela e deve sobreviver a ondas incessantes de objetos voadores inusitados, gerenciando não apenas sua pontuação, mas também sua barra de energia vital.

### 🕹️ Mecânicas Principais

- **Movimentação Fluida:** Controle lateral responsivo (Teclado).
- **Sistema de Energia:** Uma barra de combustível que diminui constantemente. Destruir uma onda completa recupera sua energia.
- **Dificuldade Progressiva:** A velocidade dos inimigos e a frequência de disparos aumentam a cada nível vencido.
- **Inimigos Diversificados:** 5 tipos de inimigos clássicos (Hambúrgueres, Bolachas, Ferros de Passar, Gravatas e Diamantes).
- **Sistema de Colisão Arcade:** Detecção precisa via AABB para uma jogabilidade justa e nostálgica.

## 🚀 Tecnologias Utilizadas

Para manter a performance e a simplicidade, o jogo foi construído sem dependências externas:

- **HTML5 Canvas:** Para renderização de gráficos 2D em alta performance.
- **Vanilla JavaScript (ES6+):** Lógica do jogo, gerenciamento de estado e física.
- **Web Audio API:** Sintetização de sons 8-bit em tempo real (sem arquivos de áudio externos).
- **CSS3:** Estilização responsiva e estética "Dark Mode" para foco total no jogo.

## 🎨 Design e Áudio

- **Pixel Art via Matriz:** Todos os sprites do jogo foram desenhados manualmente através de matrizes binárias no JavaScript, garantindo um visual pixelado perfeito e carregamento instantâneo.
- **Som Sintético:** Os efeitos sonoros de laser e explosão são gerados por osciladores de áudio no próprio navegador, simulando o chip de som dos consoles clássicos.

## 🛠️ Como Executar

1. Clone o repositório:
   ```bash
   git clone https://github.com/JoaoBrunoLuz/p5-megamania.git
   ```
2. Abra o arquivo `index.html` em qualquer navegador moderno.
3. **Pressione ESPAÇO** na tela de menu para iniciar (e habilitar o áudio).

**Comandos:**
- `Setas Esquerda/Direita` ou `A/D`: Mover a nave.
- `Barra de Espaço`: Atirar.

## 📋 Processo de Desenvolvimento

O projeto foi estruturado seguindo boas práticas de engenharia de software:
- **Arquitetura Modular:** Separação clara entre lógica de jogo (`game.js`), renderização de sprites (`sprites.js`) e motor de áudio (`audio.js`).
- **DevOps Ready:** Repositório inicializado com Git, `.gitignore` robusto e publicado via GitHub.
- **Segurança:** Revisão de código para garantir a ausência de chaves ou segredos expostos.


