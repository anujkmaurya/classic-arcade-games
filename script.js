// Game state variables
let gameBoard;
let pacmanPosition = { x: 9, y: 15 };
let ghosts = [
    { x: 9, y: 9, direction: 'up', color: 'red' },
    { x: 8, y: 9, direction: 'left', color: 'pink' },
    { x: 10, y: 9, direction: 'right', color: 'cyan' }
];
let score = 0;
let lives = 3;
let gameRunning = true;
let pacmanDirection = 'right';
let totalDots = 0;
let dotsEaten = 0;

// Game board layout (1 = wall, 0 = dot, 2 = empty path)
const boardLayout = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1],
    [2,2,2,2,0,2,2,1,2,2,2,1,2,2,0,2,2,2,2],
    [1,1,1,1,0,1,2,1,2,2,2,1,2,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,1,0,0,0,0,0,2,0,0,0,0,0,1,0,0,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Initialize the game
function initGame() {
    gameBoard = document.getElementById('game-board');
    createBoard();
    updateScore();
    updateLives();
    
    // Add event listeners for keyboard controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Start game loop
    gameLoop();
}

// Create the game board
function createBoard() {
    gameBoard.innerHTML = '';
    totalDots = 0;
    dotsEaten = 0;
    
    for (let row = 0; row < boardLayout.length; row++) {
        for (let col = 0; col < boardLayout[row].length; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${col}-${row}`;
            
            if (boardLayout[row][col] === 1) {
                cell.classList.add('wall');
            } else if (boardLayout[row][col] === 0) {
                cell.classList.add('path', 'dot');
                totalDots++;
            } else {
                cell.classList.add('path');
            }
            
            gameBoard.appendChild(cell);
        }
    }
    
    // Place Pac-Man
    updatePacmanPosition();
    
    // Place Ghosts
    updateGhostPositions();
}

// Handle keyboard input
function handleKeyPress(event) {
    if (!gameRunning) return;
    
    let newDirection = pacmanDirection;
    
    switch(event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            newDirection = 'up';
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            newDirection = 'down';
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            newDirection = 'left';
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            newDirection = 'right';
            break;
        default:
            return;
    }
    
    event.preventDefault();
    
    // Check if the new direction is valid
    const newPos = getNewPosition(pacmanPosition, newDirection);
    if (isValidMove(newPos)) {
        pacmanDirection = newDirection;
    }
}

// Get new position based on direction
function getNewPosition(position, direction) {
    const newPos = { ...position };
    
    switch(direction) {
        case 'up':
            newPos.y--;
            break;
        case 'down':
            newPos.y++;
            break;
        case 'left':
            newPos.x--;
            break;
        case 'right':
            newPos.x++;
            break;
    }
    
    // Handle screen wrapping (tunnel effect)
    if (newPos.x < 0) newPos.x = 18;
    if (newPos.x > 18) newPos.x = 0;
    if (newPos.y < 0) newPos.y = 20;
    if (newPos.y > 20) newPos.y = 0;
    
    return newPos;
}

// Check if a move is valid (not hitting a wall)
function isValidMove(position) {
    if (position.x < 0 || position.x >= 19 || position.y < 0 || position.y >= 21) {
        return false;
    }
    return boardLayout[position.y][position.x] !== 1;
}

// Move Pac-Man
function movePacman() {
    const newPos = getNewPosition(pacmanPosition, pacmanDirection);
    
    if (isValidMove(newPos)) {
        // Clear current position
        clearPacmanPosition();
        
        // Update position
        pacmanPosition = newPos;
        
        // Check for dot collection
        const cell = document.getElementById(`cell-${pacmanPosition.x}-${pacmanPosition.y}`);
        if (cell.classList.contains('dot')) {
            cell.classList.remove('dot');
            score += 10;
            dotsEaten++;
            updateScore();
            
            // Check win condition
            if (dotsEaten >= totalDots) {
                gameWin();
                return;
            }
        }
        
        // Update visual position
        updatePacmanPosition();
    }
}

// Move Ghosts with more random AI
function moveGhosts() {
    const directions = ['up', 'down', 'left', 'right'];
    
    ghosts.forEach((ghost, index) => {
        const possibleMoves = [];
        
        // Find all valid moves
        for (const direction of directions) {
            const newPos = getNewPosition(ghost, direction);
            if (isValidMove(newPos)) {
                possibleMoves.push({ direction, position: newPos });
            }
        }
        
        if (possibleMoves.length === 0) return;
        
        let selectedMove;
        
        // Make movement more random - 60% random, 40% towards player
        if (Math.random() < 0.6) {
            // Random movement
            selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        } else {
            // Move towards Pac-Man
            let bestMove = possibleMoves[0];
            let bestDistance = getDistance(bestMove.position, pacmanPosition);
            
            for (const move of possibleMoves) {
                const distance = getDistance(move.position, pacmanPosition);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestMove = move;
                }
            }
            selectedMove = bestMove;
        }
        
        // Clear current position
        clearGhostPosition(index);
        
        // Update position
        ghost.x = selectedMove.position.x;
        ghost.y = selectedMove.position.y;
        ghost.direction = selectedMove.direction;
        
        // Update visual position
        updateGhostPosition(index);
    });
}

// Calculate distance between two points
function getDistance(pos1, pos2) {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
}

// Update Pac-Man visual position
function updatePacmanPosition() {
    const cell = document.getElementById(`cell-${pacmanPosition.x}-${pacmanPosition.y}`);
    cell.classList.add('pacman', pacmanDirection);
}

// Clear Pac-Man from current position
function clearPacmanPosition() {
    const cell = document.getElementById(`cell-${pacmanPosition.x}-${pacmanPosition.y}`);
    cell.classList.remove('pacman', 'up', 'down', 'left', 'right');
}

// Update Ghost visual positions
function updateGhostPositions() {
    ghosts.forEach((ghost, index) => {
        updateGhostPosition(index);
    });
}

// Update individual Ghost visual position
function updateGhostPosition(index) {
    const ghost = ghosts[index];
    const cell = document.getElementById(`cell-${ghost.x}-${ghost.y}`);
    cell.classList.add('ghost', ghost.color);
}

// Clear all Ghosts from current positions
function clearGhostPositions() {
    ghosts.forEach((ghost, index) => {
        clearGhostPosition(index);
    });
}

// Clear individual Ghost from current position
function clearGhostPosition(index) {
    const ghost = ghosts[index];
    const cell = document.getElementById(`cell-${ghost.x}-${ghost.y}`);
    cell.classList.remove('ghost', ghost.color);
}

// Check collision between Pac-Man and Ghosts
function checkCollision() {
    for (let i = 0; i < ghosts.length; i++) {
        const ghost = ghosts[i];
        if (pacmanPosition.x === ghost.x && pacmanPosition.y === ghost.y) {
            lives--;
            updateLives();
            
            if (lives <= 0) {
                gameOver();
            } else {
                // Reset positions
                resetPositions();
            }
            return;
        }
    }
}

// Reset Pac-Man and Ghost positions after collision
function resetPositions() {
    clearPacmanPosition();
    clearGhostPositions();
    
    pacmanPosition = { x: 9, y: 15 };
    ghosts = [
        { x: 9, y: 9, direction: 'up', color: 'red' },
        { x: 8, y: 9, direction: 'left', color: 'pink' },
        { x: 10, y: 9, direction: 'right', color: 'cyan' }
    ];
    pacmanDirection = 'right';
    
    updatePacmanPosition();
    updateGhostPositions();
}

// Update score display
function updateScore() {
    document.getElementById('score').textContent = score;
}

// Update lives display
function updateLives() {
    document.getElementById('lives').textContent = lives;
}

// Game over
function gameOver() {
    gameRunning = false;
    document.getElementById('game-over-title').textContent = 'Game Over!';
    document.getElementById('game-over-message').innerHTML = `Your final score: <span id="final-score">${score}</span>`;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').classList.remove('hidden');
    document.querySelector('.game-over-content').classList.remove('win');
}

// Game win
function gameWin() {
    gameRunning = false;
    document.getElementById('game-over-title').textContent = 'You Win!';
    document.getElementById('game-over-message').innerHTML = `Congratulations! Final score: <span id="final-score">${score}</span>`;
    document.getElementById('final-score').textContent = score;
    document.getElementById('game-over').classList.remove('hidden');
    document.querySelector('.game-over-content').classList.add('win');
}

// Restart game
function restartGame() {
    // Reset game state
    pacmanPosition = { x: 9, y: 15 };
    ghosts = [
        { x: 9, y: 9, direction: 'up', color: 'red' },
        { x: 8, y: 9, direction: 'left', color: 'pink' },
        { x: 10, y: 9, direction: 'right', color: 'cyan' }
    ];
    score = 0;
    lives = 3;
    gameRunning = true;
    pacmanDirection = 'right';
    dotsEaten = 0;
    
    // Hide game over screen
    document.getElementById('game-over').classList.add('hidden');
    
    // Recreate board
    createBoard();
    updateScore();
    updateLives();
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;
    
    movePacman();
    moveGhosts();
    checkCollision();
    
    // Continue game loop
    setTimeout(gameLoop, 200); // Adjust speed here (lower = faster)
}

// Start the game when page loads
window.addEventListener('load', initGame);
