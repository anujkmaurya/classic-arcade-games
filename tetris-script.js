// Game constants
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Tetris pieces (Tetrominoes)
const PIECES = {
    I: {
        shape: [
            [1, 1, 1, 1]
        ],
        color: '#00f5ff'
    },
    O: {
        shape: [
            [1, 1],
            [1, 1]
        ],
        color: '#ffed00'
    },
    T: {
        shape: [
            [0, 1, 0],
            [1, 1, 1]
        ],
        color: '#a000ff'
    },
    S: {
        shape: [
            [0, 1, 1],
            [1, 1, 0]
        ],
        color: '#00ff00'
    },
    Z: {
        shape: [
            [1, 1, 0],
            [0, 1, 1]
        ],
        color: '#ff0000'
    },
    J: {
        shape: [
            [1, 0, 0],
            [1, 1, 1]
        ],
        color: '#0000ff'
    },
    L: {
        shape: [
            [0, 0, 1],
            [1, 1, 1]
        ],
        color: '#ff8000'
    }
};

// Game state
let board = [];
let currentPiece = null;
let nextPiece = null;
let currentX = 0;
let currentY = 0;
let score = 0;
let level = 1;
let lines = 0;
let gameRunning = false;
let isPaused = false;
let dropTime = 1000;
let lastTime = 0;

// Canvas elements
let canvas = null;
let ctx = null;
let nextCanvas = null;
let nextCtx = null;

// Sound elements
let sounds = {
    drop: null,
    lineClear: null,
    gameStart: null,
    tetris: null,
    rotate: null
};

// Sound settings
let soundEnabled = true;

// Initialize the game
function initGame() {
    canvas = document.getElementById('game-board');
    ctx = canvas.getContext('2d');
    nextCanvas = document.getElementById('next-canvas');
    nextCtx = nextCanvas.getContext('2d');
    
    // Initialize sounds
    initSounds();
    
    // Initialize empty board
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        board[row] = new Array(BOARD_WIDTH).fill(0);
    }
    
    // Set up event listeners
    document.addEventListener('keydown', handleKeyPress);
    
    // Initialize sound status display
    updateSoundStatus();
    
    // Start the game
    startGame();
}

// Initialize sound effects
function initSounds() {
    // Use Web Audio API to create sounds programmatically
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    sounds = {
        drop: createDropSound(audioContext),
        lineClear: createLineClearSound(audioContext),
        gameStart: createGameStartSound(audioContext),
        tetris: createTetrisSound(audioContext),
        rotate: createRotateSound(audioContext)
    };
}

// Create drop sound (short beep)
function createDropSound(audioContext) {
    return () => {
        if (!soundEnabled) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 220;
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    };
}

// Create line clear sound (ascending notes)
function createLineClearSound(audioContext) {
    return () => {
        if (!soundEnabled) return;
        
        const frequencies = [261.63, 329.63, 392, 523.25]; // C, E, G, C
        const duration = 0.15;
        
        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            const startTime = audioContext.currentTime + (index * duration / 2);
            const endTime = startTime + duration;
            
            gainNode.gain.setValueAtTime(0.2, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
            
            oscillator.start(startTime);
            oscillator.stop(endTime);
        });
    };
}

// Create game start sound (fanfare)
function createGameStartSound(audioContext) {
    return () => {
        if (!soundEnabled) return;
        
        const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C
        const duration = 0.3;
        
        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'triangle';
            
            const startTime = audioContext.currentTime + (index * duration / 4);
            const endTime = startTime + duration;
            
            gainNode.gain.setValueAtTime(0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
            
            oscillator.start(startTime);
            oscillator.stop(endTime);
        });
    };
}

// Create Tetris sound (special 4-line clear)
function createTetrisSound(audioContext) {
    return () => {
        if (!soundEnabled) return;
        
        const frequencies = [523.25, 659.25, 783.99, 1046.5, 1318.5]; // C, E, G, C, E
        const duration = 0.2;
        
        frequencies.forEach((freq, index) => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sawtooth';
            
            const startTime = audioContext.currentTime + (index * duration / 3);
            const endTime = startTime + duration;
            
            gainNode.gain.setValueAtTime(0.25, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, endTime);
            
            oscillator.start(startTime);
            oscillator.stop(endTime);
        });
    };
}

// Create rotate sound (quick chirp)
function createRotateSound(audioContext) {
    return () => {
        if (!soundEnabled) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.05);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.05);
    };
}

// Play sound function
function playSound(soundName) {
    if (sounds[soundName] && soundEnabled) {
        try {
            sounds[soundName]();
        } catch (error) {
            console.warn('Sound playback failed:', error);
        }
    }
}

// Start a new game
function startGame() {
    score = 0;
    level = 1;
    lines = 0;
    gameRunning = true;
    isPaused = false;
    dropTime = 1000;
    
    // Play game start sound
    playSound('gameStart');
    
    // Clear board
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        board[row].fill(0);
    }
    
    // Generate first pieces
    nextPiece = getRandomPiece();
    spawnNewPiece();
    
    updateDisplay();
    gameLoop();
}

// Get random piece
function getRandomPiece() {
    const pieceTypes = Object.keys(PIECES);
    const randomType = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
    return {
        type: randomType,
        shape: PIECES[randomType].shape,
        color: PIECES[randomType].color
    };
}

// Spawn new piece
function spawnNewPiece() {
    currentPiece = nextPiece;
    nextPiece = getRandomPiece();
    
    currentX = Math.floor((BOARD_WIDTH - currentPiece.shape[0].length) / 2);
    currentY = 0;
    
    // Check if game is over
    if (checkCollision(currentPiece.shape, currentX, currentY)) {
        gameOver();
        return;
    }
    
    drawNextPiece();
}

// Handle keyboard input
function handleKeyPress(event) {
    if (!gameRunning) return;
    
    switch(event.key) {
        case 'ArrowLeft':
            movePiece(-1, 0);
            break;
        case 'ArrowRight':
            movePiece(1, 0);
            break;
        case 'ArrowDown':
            movePiece(0, 1);
            break;
        case 'ArrowUp':
        case ' ':
            rotatePiece();
            break;
        case 'p':
        case 'P':
            togglePause();
            break;
        case 'm':
        case 'M':
            toggleSound();
            break;
    }
    
    event.preventDefault();
}

// Move piece
function movePiece(dx, dy) {
    if (isPaused) return;
    
    const newX = currentX + dx;
    const newY = currentY + dy;
    
    if (!checkCollision(currentPiece.shape, newX, newY)) {
        currentX = newX;
        currentY = newY;
        draw();
    } else if (dy > 0) {
        // Piece has landed
        placePiece();
    }
}

// Rotate piece
function rotatePiece() {
    if (isPaused) return;
    
    const rotated = rotateMatrix(currentPiece.shape);
    
    if (!checkCollision(rotated, currentX, currentY)) {
        currentPiece.shape = rotated;
        playSound('rotate');
        draw();
    }
}

// Rotate matrix 90 degrees clockwise
function rotateMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const rotated = [];
    
    for (let col = 0; col < cols; col++) {
        rotated[col] = [];
        for (let row = rows - 1; row >= 0; row--) {
            rotated[col][rows - 1 - row] = matrix[row][col];
        }
    }
    
    return rotated;
}

// Check collision
function checkCollision(shape, x, y) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                
                if (newX < 0 || newX >= BOARD_WIDTH || 
                    newY >= BOARD_HEIGHT || 
                    (newY >= 0 && board[newY][newX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

// Place piece on board
function placePiece() {
    // Play drop sound
    playSound('drop');
    
    for (let row = 0; row < currentPiece.shape.length; row++) {
        for (let col = 0; col < currentPiece.shape[row].length; col++) {
            if (currentPiece.shape[row][col]) {
                const boardY = currentY + row;
                const boardX = currentX + col;
                
                if (boardY >= 0) {
                    board[boardY][boardX] = currentPiece.color;
                }
            }
        }
    }
    
    // Check for completed lines
    clearLines();
    
    // Spawn new piece
    spawnNewPiece();
    draw();
}

// Clear completed lines
function clearLines() {
    let linesCleared = 0;
    
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
        if (board[row].every(cell => cell !== 0)) {
            board.splice(row, 1);
            board.unshift(new Array(BOARD_WIDTH).fill(0));
            linesCleared++;
            row++; // Check the same row again
        }
    }
    
    if (linesCleared > 0) {
        // Play appropriate sound
        if (linesCleared === 4) {
            playSound('tetris'); // Special sound for Tetris (4 lines)
        } else {
            playSound('lineClear'); // Regular line clear sound
        }
        
        // Update score and lines
        const points = [0, 100, 300, 500, 800][linesCleared] * level;
        score += points;
        lines += linesCleared;
        
        // Increase level every 10 lines
        const newLevel = Math.floor(lines / 10) + 1;
        if (newLevel > level) {
            level = newLevel;
            dropTime = Math.max(50, 1000 - (level - 1) * 100);
        }
        
        updateDisplay();
    }
}

// Toggle pause
function togglePause() {
    isPaused = !isPaused;
}

// Toggle sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    updateSoundStatus();
}

// Update sound status display
function updateSoundStatus() {
    const soundStatus = document.getElementById('sound-status');
    if (soundStatus) {
        soundStatus.textContent = soundEnabled ? '🔊 Sound ON' : '🔇 Sound OFF';
    }
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw board
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            if (board[row][col]) {
                drawBlock(ctx, col * BLOCK_SIZE, row * BLOCK_SIZE, board[row][col]);
            }
        }
    }
    
    // Draw current piece
    if (currentPiece) {
        for (let row = 0; row < currentPiece.shape.length; row++) {
            for (let col = 0; col < currentPiece.shape[row].length; col++) {
                if (currentPiece.shape[row][col]) {
                    const x = (currentX + col) * BLOCK_SIZE;
                    const y = (currentY + row) * BLOCK_SIZE;
                    drawBlock(ctx, x, y, currentPiece.color);
                }
            }
        }
    }
    
    // Draw grid lines
    drawGrid();
}

// Draw a single block
function drawBlock(context, x, y, color) {
    context.fillStyle = color;
    context.fillRect(x, y, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
    
    // Add highlight effect
    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
    context.fillRect(x, y, BLOCK_SIZE - 1, 2);
    context.fillRect(x, y, 2, BLOCK_SIZE - 1);
}

// Draw grid
function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let col = 1; col < BOARD_WIDTH; col++) {
        ctx.beginPath();
        ctx.moveTo(col * BLOCK_SIZE, 0);
        ctx.lineTo(col * BLOCK_SIZE, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let row = 1; row < BOARD_HEIGHT; row++) {
        ctx.beginPath();
        ctx.moveTo(0, row * BLOCK_SIZE);
        ctx.lineTo(canvas.width, row * BLOCK_SIZE);
        ctx.stroke();
    }
}

// Draw next piece
function drawNextPiece() {
    if (!nextPiece) return;
    
    // Clear next canvas
    nextCtx.fillStyle = '#000';
    nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
    
    const blockSize = 20;
    const offsetX = (nextCanvas.width - nextPiece.shape[0].length * blockSize) / 2;
    const offsetY = (nextCanvas.height - nextPiece.shape.length * blockSize) / 2;
    
    for (let row = 0; row < nextPiece.shape.length; row++) {
        for (let col = 0; col < nextPiece.shape[row].length; col++) {
            if (nextPiece.shape[row][col]) {
                const x = offsetX + col * blockSize;
                const y = offsetY + row * blockSize;
                
                nextCtx.fillStyle = nextPiece.color;
                nextCtx.fillRect(x, y, blockSize - 1, blockSize - 1);
                
                // Add highlight
                nextCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                nextCtx.fillRect(x, y, blockSize - 1, 2);
                nextCtx.fillRect(x, y, 2, blockSize - 1);
            }
        }
    }
}

// Update display
function updateDisplay() {
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lines').textContent = lines;
}

// Game over
function gameOver() {
    gameRunning = false;
    
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-lines').textContent = lines;
    document.getElementById('game-over').classList.remove('hidden');
}

// Restart game
function restartGame() {
    document.getElementById('game-over').classList.add('hidden');
    startGame();
}

// Game loop
function gameLoop(currentTime = 0) {
    if (!gameRunning) return;
    
    const deltaTime = currentTime - lastTime;
    
    if (!isPaused && deltaTime > dropTime) {
        movePiece(0, 1);
        lastTime = currentTime;
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game when page loads
window.addEventListener('load', initGame);
