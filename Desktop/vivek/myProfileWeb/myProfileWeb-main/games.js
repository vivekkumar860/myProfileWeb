/* ============================================================
   GAMES MODULE - 5 Playable Games for Portfolio
   ============================================================ */

// ============================================================
// MODAL LOGIC
// ============================================================
(function() {
    const gameInstances = {};

    // Single consolidated click listener for play, close, and backdrop
    document.addEventListener('click', function(e) {
        const playBtn = e.target.closest('.game-play-btn');
        if (playBtn) {
            const gameId = playBtn.dataset.game;
            openGameModal(gameId);
            return;
        }

        const closeBtn = e.target.closest('.game-modal-close');
        if (closeBtn) {
            const modal = closeBtn.closest('.game-modal');
            closeGameModal(modal);
            return;
        }

        // Backdrop click
        if (e.target.classList.contains('game-modal')) {
            closeGameModal(e.target);
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.game-modal.active');
            if (activeModal) closeGameModal(activeModal);
        }
    });

    function openGameModal(gameId) {
        const modal = document.getElementById(gameId + '-modal');
        if (!modal) return;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        initGame(gameId);
    }

    function closeGameModal(modal) {
        if (!modal) return;
        modal.classList.remove('active');
        document.body.style.overflow = '';
        const gameId = modal.id.replace('-modal', '');
        if (gameInstances[gameId] && gameInstances[gameId].destroy) {
            gameInstances[gameId].destroy();
        }
        gameInstances[gameId] = null;
        // Remove any overlay messages
        const overlay = modal.querySelector('.game-overlay-msg');
        if (overlay) overlay.remove();
    }

    // Shared helper: show in-game overlay instead of alert()
    window.showGameOverlay = function(modal, title, text) {
        // Remove existing overlay if any
        const existing = modal.querySelector('.game-overlay-msg');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'game-overlay-msg show';
        const titleEl = document.createElement('h4');
        titleEl.textContent = title;
        const textEl = document.createElement('p');
        textEl.textContent = text;
        overlay.appendChild(titleEl);
        overlay.appendChild(textEl);
        modal.querySelector('.game-modal-content').appendChild(overlay);
    }

    function initGame(gameId) {
        if (gameInstances[gameId] && gameInstances[gameId].destroy) {
            gameInstances[gameId].destroy();
        }
        switch (gameId) {
            case 'snake': gameInstances[gameId] = new SnakeGame(); break;
            case 'tictactoe': gameInstances[gameId] = new TicTacToe(); break;
            case 'memory': gameInstances[gameId] = new MemoryGame(); break;
            case 'game2048': gameInstances[gameId] = new Game2048(); break;
            case 'whackamole': gameInstances[gameId] = new WhackAMole(); break;
        }
    }


// ============================================================
// 1. SNAKE GAME
// ============================================================
class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('snake-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = 20;
        this.canvas.width = this.tileCount * this.gridSize;
        this.canvas.height = this.tileCount * this.gridSize;
        this.scoreEl = document.getElementById('snake-score');
        this.restartBtn = document.getElementById('snake-restart');
        this.running = false;
        this.animFrame = null;
        this.lastTime = 0;

        this._onKey = this.handleKey.bind(this);
        this._onRestart = this.restart.bind(this);
        this._boundLoop = this.loop.bind(this); // store once, avoid per-frame .bind()
        document.addEventListener('keydown', this._onKey);
        this.restartBtn.addEventListener('click', this._onRestart);

        this.restart();
    }

    restart() {
        this.snake = [{ x: 10, y: 10 }];
        this.dir = { x: 0, y: 0 };
        this.nextDir = { x: 0, y: 0 };
        this.food = this.spawnFood();
        this.score = 0;
        this.scoreEl.textContent = '0';
        this.gameOver = false;
        this.running = true;
        this.speed = 120;
        this.accumulated = 0;
        this.lastTime = performance.now();
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        this.loop(performance.now());
    }

    spawnFood() {
        let pos;
        do {
            pos = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(s => s.x === pos.x && s.y === pos.y));
        return pos;
    }

    handleKey(e) {
        if (!document.getElementById('snake-modal').classList.contains('active')) return;
        const map = {
            ArrowUp: { x: 0, y: -1 },
            ArrowDown: { x: 0, y: 1 },
            ArrowLeft: { x: -1, y: 0 },
            ArrowRight: { x: 1, y: 0 }
        };
        const nd = map[e.key];
        if (nd) {
            e.preventDefault();
            if (nd.x !== -this.dir.x || nd.y !== -this.dir.y) {
                this.nextDir = nd;
            }
        }
    }

    loop(time) {
        if (!this.running) return;
        this.accumulated += time - this.lastTime;
        this.lastTime = time;

        if (this.accumulated >= this.speed) {
            this.accumulated -= this.speed;
            this.update();
        }
        this.draw();
        this.animFrame = requestAnimationFrame(this._boundLoop);
    }

    update() {
        if (this.gameOver) return;
        this.dir = { ...this.nextDir };
        if (this.dir.x === 0 && this.dir.y === 0) return;

        const head = {
            x: this.snake[0].x + this.dir.x,
            y: this.snake[0].y + this.dir.y
        };

        // Wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver = true;
            return;
        }
        // Self collision
        if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
            this.gameOver = true;
            return;
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score++;
            this.scoreEl.textContent = this.score;
            this.food = this.spawnFood();
            // Logarithmic speed curve instead of linear speed -= 2
            this.speed = Math.max(70, 120 - Math.log(this.score + 1) * 12);
        } else {
            this.snake.pop();
        }
    }

    draw() {
        const g = this.gridSize;
        this.ctx.fillStyle = '#0f0f23';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid lines
        this.ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * g, 0);
            this.ctx.lineTo(i * g, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * g);
            this.ctx.lineTo(this.canvas.width, i * g);
            this.ctx.stroke();
        }

        // Food
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * g + g / 2,
            this.food.y * g + g / 2,
            g / 2 - 2, 0, Math.PI * 2
        );
        this.ctx.fill();

        // Snake
        this.snake.forEach((seg, i) => {
            this.ctx.fillStyle = i === 0 ? '#22c55e' : '#4ade80';
            this.ctx.fillRect(seg.x * g + 1, seg.y * g + 1, g - 2, g - 2);
            this.ctx.strokeStyle = '#166534';
            this.ctx.strokeRect(seg.x * g + 1, seg.y * g + 1, g - 2, g - 2);
        });

        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = '#FCD34D';
            this.ctx.font = 'bold 28px Inter, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 10);
            this.ctx.fillStyle = '#ccc';
            this.ctx.font = '16px Inter, sans-serif';
            this.ctx.fillText('Press Restart to play again', this.canvas.width / 2, this.canvas.height / 2 + 20);
        }
    }

    destroy() {
        this.running = false;
        if (this.animFrame) cancelAnimationFrame(this.animFrame);
        document.removeEventListener('keydown', this._onKey);
        this.restartBtn.removeEventListener('click', this._onRestart);
    }
}


// ============================================================
// 2. TIC-TAC-TOE
// ============================================================
class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.cells = document.querySelectorAll('.ttt-cell');
        this.statusEl = document.getElementById('ttt-status');
        this.scoreEls = {
            wins: document.getElementById('ttt-wins'),
            losses: document.getElementById('ttt-losses'),
            draws: document.getElementById('ttt-draws')
        };
        this.restartBtn = document.getElementById('ttt-restart');
        this.scores = { wins: 0, losses: 0, draws: 0 };
        this.playerTurn = true;
        this.gameActive = true;
        this._aiTimeout = null;

        this._onClick = this.handleClick.bind(this);
        this._onRestart = this.restart.bind(this);
        this.cells.forEach(c => c.addEventListener('click', this._onClick));
        this.restartBtn.addEventListener('click', this._onRestart);

        this.restart();
    }

    restart() {
        this.board = Array(9).fill(null);
        this.playerTurn = true;
        this.gameActive = true;
        if (this._aiTimeout) { clearTimeout(this._aiTimeout); this._aiTimeout = null; }
        this.cells.forEach(c => {
            c.textContent = '';
            c.className = 'ttt-cell';
        });
        this.statusEl.textContent = 'Your turn (X)';
    }

    handleClick(e) {
        if (!this.gameActive || !this.playerTurn) return;
        const idx = parseInt(e.target.dataset.index);
        if (this.board[idx]) return;

        this.makeMove(idx, 'X');
        if (this.checkEnd()) return;

        this.playerTurn = false;
        this.statusEl.textContent = 'AI thinking...';
        this._aiTimeout = setTimeout(() => {
            this._aiTimeout = null;
            // Check if game is still active before making AI move
            if (!this.gameActive) return;
            const aiMove = this.getAIMove();
            if (aiMove === undefined || aiMove === null) return; // defensive guard
            this.makeMove(aiMove, 'O');
            if (!this.checkEnd()) {
                this.playerTurn = true;
                this.statusEl.textContent = 'Your turn (X)';
            }
        }, 300);
    }

    makeMove(idx, mark) {
        this.board[idx] = mark;
        this.cells[idx].textContent = mark;
        this.cells[idx].classList.add(mark.toLowerCase());
    }

    checkEnd() {
        const winner = this.getWinner();
        if (winner) {
            const lines = [
                [0,1,2],[3,4,5],[6,7,8],
                [0,3,6],[1,4,7],[2,5,8],
                [0,4,8],[2,4,6]
            ];
            for (const line of lines) {
                if (line.every(i => this.board[i] === winner)) {
                    line.forEach(i => this.cells[i].classList.add('winner'));
                    break;
                }
            }
            this.gameActive = false;
            if (winner === 'X') {
                this.statusEl.textContent = 'You win!';
                this.scores.wins++;
                this.scoreEls.wins.textContent = this.scores.wins;
            } else {
                this.statusEl.textContent = 'AI wins!';
                this.scores.losses++;
                this.scoreEls.losses.textContent = this.scores.losses;
            }
            return true;
        }
        if (this.board.every(c => c)) {
            this.gameActive = false;
            this.statusEl.textContent = "It's a draw!";
            this.scores.draws++;
            this.scoreEls.draws.textContent = this.scores.draws;
            return true;
        }
        return false;
    }

    getWinner() {
        const lines = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ];
        for (const [a, b, c] of lines) {
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a];
            }
        }
        return null;
    }

    getAIMove() {
        const empty = this.board.map((v, i) => v ? -1 : i).filter(i => i >= 0);
        if (empty.length === 0) return undefined; // defensive guard for full board

        // Try to win
        for (let i = 0; i < 9; i++) {
            if (!this.board[i]) {
                this.board[i] = 'O';
                if (this.getWinner() === 'O') { this.board[i] = null; return i; }
                this.board[i] = null;
            }
        }
        // Block player win
        for (let i = 0; i < 9; i++) {
            if (!this.board[i]) {
                this.board[i] = 'X';
                if (this.getWinner() === 'X') { this.board[i] = null; return i; }
                this.board[i] = null;
            }
        }
        // Center
        if (!this.board[4]) return 4;
        // Corners
        const corners = [0, 2, 6, 8].filter(i => !this.board[i]);
        if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
        // Random from remaining
        return empty[Math.floor(Math.random() * empty.length)];
    }

    destroy() {
        if (this._aiTimeout) { clearTimeout(this._aiTimeout); this._aiTimeout = null; }
        this.cells.forEach(c => c.removeEventListener('click', this._onClick));
        this.restartBtn.removeEventListener('click', this._onRestart);
    }
}


// ============================================================
// 3. MEMORY CARD MATCH
// ============================================================
class MemoryGame {
    constructor() {
        this.emojis = ['🎮', '🎯', '🚀', '💎', '🔥', '⚡', '🎨', '🎵'];
        this.boardEl = document.getElementById('memory-board');
        this.movesEl = document.getElementById('memory-moves');
        this.timerEl = document.getElementById('memory-timer');
        this.restartBtn = document.getElementById('memory-restart');
        this.matched = 0;
        this.moves = 0;
        this.flippedCards = [];
        this.locked = false;
        this.timerInterval = null;
        this.seconds = 0;
        this.started = false;

        this._onRestart = this.restart.bind(this);
        // Event delegation on board instead of per-card listeners
        this._onBoardClick = this.handleBoardClick.bind(this);
        this.restartBtn.addEventListener('click', this._onRestart);
        this.boardEl.addEventListener('click', this._onBoardClick);

        this.restart();
    }

    restart() {
        this.matched = 0;
        this.moves = 0;
        this.flippedCards = [];
        this.locked = false;
        this.seconds = 0;
        this.started = false;
        this.movesEl.textContent = '0';
        this.timerEl.textContent = '0:00';
        clearInterval(this.timerInterval);

        const cards = [...this.emojis, ...this.emojis];
        this.shuffle(cards);

        this.boardEl.innerHTML = '';
        cards.forEach((emoji, idx) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.emoji = emoji;
            card.dataset.index = idx;
            const innerDiv = document.createElement('div');
            innerDiv.className = 'memory-card-inner';
            const frontDiv = document.createElement('div');
            frontDiv.className = 'memory-card-front';
            frontDiv.textContent = '?';
            const backDiv = document.createElement('div');
            backDiv.className = 'memory-card-back';
            backDiv.textContent = emoji;
            innerDiv.appendChild(frontDiv);
            innerDiv.appendChild(backDiv);
            card.appendChild(innerDiv);
            this.boardEl.appendChild(card);
        });
    }

    shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    handleBoardClick(e) {
        const card = e.target.closest('.memory-card');
        if (!card) return;
        this.flipCard(card);
    }

    flipCard(card) {
        if (this.locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;

        if (!this.started) {
            this.started = true;
            this.timerInterval = setInterval(() => {
                this.seconds++;
                const m = Math.floor(this.seconds / 60);
                const s = this.seconds % 60;
                this.timerEl.textContent = m + ':' + s.toString().padStart(2, '0');
            }, 1000);
        }

        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.movesEl.textContent = this.moves;
            this.locked = true;

            const [a, b] = this.flippedCards;
            if (a.dataset.emoji === b.dataset.emoji) {
                a.classList.add('matched');
                b.classList.add('matched');
                this.matched++;
                this.flippedCards = [];
                this.locked = false;

                if (this.matched === this.emojis.length) {
                    clearInterval(this.timerInterval);
                    const modal = document.getElementById('memory-modal');
                    setTimeout(() => {
                        window.showGameOverlay(modal, 'You Won!', 'Completed in ' + this.moves + ' moves & ' + this.timerEl.textContent);
                    }, 400);
                }
            } else {
                setTimeout(() => {
                    a.classList.remove('flipped');
                    b.classList.remove('flipped');
                    this.flippedCards = [];
                    this.locked = false;
                }, 800);
            }
        }
    }

    destroy() {
        clearInterval(this.timerInterval);
        this.boardEl.removeEventListener('click', this._onBoardClick);
        this.restartBtn.removeEventListener('click', this._onRestart);
    }
}


// ============================================================
// 4. 2048 GAME
// ============================================================
class Game2048 {
    constructor() {
        this.boardEl = document.getElementById('game2048-board');
        this.scoreEl = document.getElementById('game2048-score');
        this.bestEl = document.getElementById('game2048-best');
        this.restartBtn = document.getElementById('game2048-restart');
        this.size = 4;
        this.score = 0;

        // Wrap localStorage in try/catch with feature detection
        this.best = 0;
        if (typeof Storage !== 'undefined') {
            try {
                this.best = parseInt(localStorage.getItem('best2048') || '0');
            } catch (e) {
                this.best = 0;
            }
        }
        this.bestEl.textContent = this.best;

        this._onKey = this.handleKey.bind(this);
        this._onRestart = this.restart.bind(this);
        this._touchStartX = 0;
        this._touchStartY = 0;
        this._onTouchStart = this.handleTouchStart.bind(this);
        this._onTouchEnd = this.handleTouchEnd.bind(this);

        document.addEventListener('keydown', this._onKey);
        // Add touch events only if touch is supported
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.boardEl.addEventListener('touchstart', this._onTouchStart, { passive: false });
            this.boardEl.addEventListener('touchend', this._onTouchEnd, { passive: false });
        }
        this.restartBtn.addEventListener('click', this._onRestart);

        this.restart();
    }

    restart() {
        this.grid = Array.from({ length: this.size }, () => Array(this.size).fill(0));
        this.score = 0;
        this.scoreEl.textContent = '0';
        this.gameOver = false;
        // Remove overlay if present
        const modal = document.getElementById('game2048-modal');
        const overlay = modal ? modal.querySelector('.game-overlay-msg') : null;
        if (overlay) overlay.remove();
        this.addRandomTile();
        this.addRandomTile();
        this.render();
    }

    addRandomTile() {
        const empty = [];
        for (let r = 0; r < this.size; r++)
            for (let c = 0; c < this.size; c++)
                if (this.grid[r][c] === 0) empty.push([r, c]);
        if (!empty.length) return;
        const [r, c] = empty[Math.floor(Math.random() * empty.length)];
        this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
    }

    handleKey(e) {
        if (!document.getElementById('game2048-modal').classList.contains('active')) return;
        if (this.gameOver) return;
        const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
        if (map[e.key]) {
            e.preventDefault();
            this.move(map[e.key]);
        }
    }

    handleTouchStart(e) {
        // Check modal is active before handling touch
        if (!document.getElementById('game2048-modal').classList.contains('active')) return;
        this._touchStartX = e.touches[0].clientX;
        this._touchStartY = e.touches[0].clientY;
    }

    handleTouchEnd(e) {
        if (!document.getElementById('game2048-modal').classList.contains('active')) return;
        if (this.gameOver) return;
        const dx = e.changedTouches[0].clientX - this._touchStartX;
        const dy = e.changedTouches[0].clientY - this._touchStartY;
        const minSwipe = 30;
        if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

        if (Math.abs(dx) > Math.abs(dy)) {
            this.move(dx > 0 ? 'right' : 'left');
        } else {
            this.move(dy > 0 ? 'down' : 'up');
        }
    }

    move(direction) {
        const prev = JSON.stringify(this.grid);
        const rotated = this.rotateToLeft(direction);
        const merged = rotated.map(row => this.mergeRow(row));
        this.grid = this.rotateFromLeft(merged, direction);

        if (JSON.stringify(this.grid) !== prev) {
            this.addRandomTile();
            this.render();
            if (!this.canMove()) {
                this.gameOver = true;
                const modal = document.getElementById('game2048-modal');
                setTimeout(() => {
                    window.showGameOverlay(modal, 'Game Over!', 'Final Score: ' + this.score);
                }, 200);
            }
        }
    }

    mergeRow(row) {
        let arr = row.filter(v => v !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] === arr[i + 1]) {
                arr[i] *= 2;
                this.score += arr[i];
                arr[i + 1] = 0;
            }
        }
        arr = arr.filter(v => v !== 0);
        while (arr.length < this.size) arr.push(0);
        return arr;
    }

    rotateToLeft(dir) {
        const g = this.grid;
        switch (dir) {
            case 'left': return g.map(r => [...r]);
            case 'right': return g.map(r => [...r].reverse());
            case 'up': return Array.from({ length: this.size }, (_, c) =>
                Array.from({ length: this.size }, (_, r) => g[r][c]));
            case 'down': return Array.from({ length: this.size }, (_, c) =>
                Array.from({ length: this.size }, (_, r) => g[this.size - 1 - r][c]));
        }
    }

    rotateFromLeft(merged, dir) {
        const s = this.size;
        switch (dir) {
            case 'left': return merged;
            case 'right': return merged.map(r => [...r].reverse());
            case 'up': return Array.from({ length: s }, (_, r) =>
                Array.from({ length: s }, (_, c) => merged[c][r]));
            case 'down': return Array.from({ length: s }, (_, r) =>
                Array.from({ length: s }, (_, c) => merged[c][s - 1 - r]));
        }
    }

    canMove() {
        for (let r = 0; r < this.size; r++)
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) return true;
                if (c < this.size - 1 && this.grid[r][c] === this.grid[r][c + 1]) return true;
                if (r < this.size - 1 && this.grid[r][c] === this.grid[r + 1][c]) return true;
            }
        return false;
    }

    render() {
        this.scoreEl.textContent = this.score;
        if (this.score > this.best) {
            this.best = this.score;
            this.bestEl.textContent = this.best;
            if (typeof Storage !== 'undefined') {
                try {
                    localStorage.setItem('best2048', this.best);
                } catch (e) { /* storage full or blocked */ }
            }
        }

        this.boardEl.innerHTML = '';
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                const tile = document.createElement('div');
                tile.className = 'tile-2048';
                const val = this.grid[r][c];
                if (val) {
                    tile.textContent = val;
                    tile.dataset.value = val;
                }
                this.boardEl.appendChild(tile);
            }
        }
    }

    destroy() {
        document.removeEventListener('keydown', this._onKey);
        if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
            this.boardEl.removeEventListener('touchstart', this._onTouchStart);
            this.boardEl.removeEventListener('touchend', this._onTouchEnd);
        }
        this.restartBtn.removeEventListener('click', this._onRestart);
    }
}


// ============================================================
// 5. WHACK-A-MOLE
// ============================================================
class WhackAMole {
    constructor() {
        this.holes = document.querySelectorAll('.wam-hole');
        this.scoreEl = document.getElementById('wam-score');
        this.timerEl = document.getElementById('wam-timer');
        this.startBtn = document.getElementById('wam-start');
        this.score = 0;
        this.timeLeft = 30;
        this.gameActive = false;
        this.moleTimeout = null;
        this._whackTimeout = null;
        this.timerInterval = null;
        this.currentMole = null;
        this.difficulty = 1;

        this._onStart = this.start.bind(this);
        this._onBoardClick = this.handleBoardClick.bind(this);
        this.startBtn.addEventListener('click', this._onStart);
        // Use event delegation for better performance
        const board = document.querySelector('.wam-board');
        if (board) {
            board.addEventListener('click', this._onBoardClick);
        }

        this.resetDisplay();
    }

    resetDisplay() {
        this.scoreEl.textContent = '0';
        this.timerEl.textContent = '30';
        this.holes.forEach(h => {
            h.textContent = '';
            h.classList.remove('mole-up', 'whacked');
        });
    }

    start() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameActive = true;
        this.difficulty = 1;
        this.resetDisplay();
        this.startBtn.disabled = true;
        this.startBtn.textContent = 'Playing...';

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.timerEl.textContent = this.timeLeft;
            if (this.timeLeft <= 20) this.difficulty = 1.3;
            if (this.timeLeft <= 10) this.difficulty = 1.6;
            if (this.timeLeft <= 0) this.endGame();
        }, 1000);

        this.showMole();
    }

    showMole() {
        if (!this.gameActive) return;

        // Clear previous mole
        this.holes.forEach(h => {
            h.classList.remove('mole-up');
            h.textContent = '';
        });

        const idx = Math.floor(Math.random() * this.holes.length);
        this.currentMole = idx;
        this.holes[idx].classList.add('mole-up');
        this.holes[idx].textContent = '🐹';

        const showTime = Math.max(400, (1000 - this.difficulty * 100) / this.difficulty);
        this.moleTimeout = setTimeout(() => {
            if (this.holes[idx].classList.contains('mole-up')) {
                this.holes[idx].classList.remove('mole-up');
                this.holes[idx].textContent = '';
            }
            this.showMole();
        }, showTime);
    }

    handleBoardClick(e) {
        const hole = e.target.closest('.wam-hole');
        if (!hole) return;
        this.whack(hole);
    }

    whack(hole) {
        if (!this.gameActive) return;
        const idx = parseInt(hole.dataset.index);

        if (idx === this.currentMole && hole.classList.contains('mole-up')) {
            this.score++;
            this.scoreEl.textContent = this.score;
            hole.classList.remove('mole-up');
            hole.classList.add('whacked');
            hole.textContent = '💥';

            clearTimeout(this.moleTimeout);
            this._whackTimeout = setTimeout(() => {
                this._whackTimeout = null;
                hole.classList.remove('whacked');
                hole.textContent = '';
                this.showMole();
            }, 200);
        }
    }

    endGame() {
        this.gameActive = false;
        clearTimeout(this.moleTimeout);
        clearTimeout(this._whackTimeout);
        clearInterval(this.timerInterval);
        this.holes.forEach(h => {
            h.classList.remove('mole-up');
            h.textContent = '';
        });
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Play Again';
        this.timerEl.textContent = '0';
        const modal = document.getElementById('whackamole-modal');
        setTimeout(() => {
            window.showGameOverlay(modal, "Time's Up!", 'Your score: ' + this.score);
        }, 200);
    }

    destroy() {
        this.gameActive = false;
        clearTimeout(this.moleTimeout);
        clearTimeout(this._whackTimeout);
        clearInterval(this.timerInterval);
        this.startBtn.removeEventListener('click', this._onStart);
        const board = document.querySelector('.wam-board');
        if (board) {
            board.removeEventListener('click', this._onBoardClick);
        }
        this.startBtn.disabled = false;
        this.startBtn.textContent = 'Start Game';
    }
}

})(); // End IIFE
