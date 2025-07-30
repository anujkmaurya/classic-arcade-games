// Game navigation functionality
function playGame(gameType) {
    // Add click animation
    const clickedCard = event.currentTarget;
    clickedCard.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        clickedCard.style.transform = '';
        
        // Navigate to the selected game
        if (gameType === 'pacman') {
            window.location.href = 'pacman.html';
        } else if (gameType === 'tetris') {
            window.location.href = 'tetris.html';
        }
    }, 150);
}

// Add keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === '1') {
        playGame('pacman');
    } else if (event.key === '2') {
        playGame('tetris');
    }
});

// Add particle effect on page load
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    initVisitorCounter();
    
    // Add hover sound effects (optional)
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', playHoverSound);
    });
});

// Visitor Counter System
function initVisitorCounter() {
    // Check if this is a unique visitor
    const hasVisited = localStorage.getItem('arcade-games-visited');
    const visitTimestamp = localStorage.getItem('arcade-games-visit-time');
    const currentTime = Date.now();
    
    // Consider a visit unique if:
    // 1. Never visited before, OR
    // 2. Last visit was more than 24 hours ago (to handle cleared storage)
    const isUniqueVisit = !hasVisited || !visitTimestamp || 
                         (currentTime - parseInt(visitTimestamp)) > (24 * 60 * 60 * 1000);
    
    if (isUniqueVisit) {
        incrementVisitorCount();
        localStorage.setItem('arcade-games-visited', 'true');
        localStorage.setItem('arcade-games-visit-time', currentTime.toString());
    }
    
    // Display current count
    displayVisitorCount();
}

function incrementVisitorCount() {
    // Get current count from localStorage (fallback to a base number for new deployments)
    let currentCount = parseInt(localStorage.getItem('arcade-games-total-visitors')) || 147; // Starting with a reasonable number
    currentCount++;
    localStorage.setItem('arcade-games-total-visitors', currentCount.toString());
    
    // In a real-world scenario, you'd send this to a backend API
    // For this demo, we're using localStorage which is per-browser
    console.log(`New unique visitor! Total count: ${currentCount}`);
}

function displayVisitorCount() {
    const countElement = document.getElementById('visitor-count');
    if (countElement) {
        const count = parseInt(localStorage.getItem('arcade-games-total-visitors')) || 147;
        countElement.textContent = count.toLocaleString(); // Formats number with commas
        
        // Add a nice animation
        countElement.style.opacity = '0';
        setTimeout(() => {
            countElement.style.opacity = '1';
            countElement.style.transition = 'opacity 0.5s ease-in-out';
        }, 100);
    }
}

// Export function for use in other pages
window.getVisitorCount = function() {
    return parseInt(localStorage.getItem('arcade-games-total-visitors')) || 147;
};

// Create floating particles background
function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles-container';
    particleContainer.style.position = 'fixed';
    particleContainer.style.top = '0';
    particleContainer.style.left = '0';
    particleContainer.style.width = '100%';
    particleContainer.style.height = '100%';
    particleContainer.style.pointerEvents = 'none';
    particleContainer.style.zIndex = '-1';
    
    document.body.appendChild(particleContainer);
    
    // Create 20 floating particles
    for (let i = 0; i < 20; i++) {
        setTimeout(() => createParticle(particleContainer), i * 200);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    const size = Math.random() * 6 + 2;
    const x = Math.random() * window.innerWidth;
    const animationDuration = Math.random() * 20 + 10;
    
    particle.style.position = 'absolute';
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.backgroundColor = getRandomColor();
    particle.style.borderRadius = '50%';
    particle.style.left = x + 'px';
    particle.style.top = '100vh';
    particle.style.opacity = '0.6';
    particle.style.animation = `floatUp ${animationDuration}s linear infinite`;
    
    container.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
        // Create a new particle to replace it
        createParticle(container);
    }, animationDuration * 1000);
}

function getRandomColor() {
    const colors = [
        '#FFD700', // Gold
        '#4a90e2', // Blue  
        '#FF6B6B', // Red
        '#4ECDC4', // Teal
        '#45B7D1', // Light Blue
        '#96CEB4', // Mint
        '#FFEAA7', // Light Yellow
        '#DDA0DD'  // Plum
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Add CSS for particle animation
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
        }
        10% {
            opacity: 0.6;
        }
        90% {
            opacity: 0.6;
        }
        100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
        }
    }
    
    .particles-container {
        overflow: hidden;
    }
`;
document.head.appendChild(style);

// Optional hover sound effect (using Web Audio API)
function playHoverSound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
        // Silent fail if audio context is not available
    }
}

// Add welcome message
console.log('🎮 Welcome to Classic Arcade Games!');
console.log('Press 1 for Pac-Man or 2 for Tetris');
console.log('Built with ❤️ using vanilla JavaScript');

// Performance optimization - lazy load games
function preloadGame(gameType) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    if (gameType === 'pacman') {
        link.href = 'pacman.html';
    } else if (gameType === 'tetris') {
        link.href = 'tetris.html';
    }
    document.head.appendChild(link);
}

// Preload games on hover for faster navigation
document.addEventListener('DOMContentLoaded', function() {
    const pacmanCard = document.querySelector('.pacman-card');
    const tetrisCard = document.querySelector('.tetris-card');
    
    if (pacmanCard) {
        pacmanCard.addEventListener('mouseenter', () => preloadGame('pacman'));
    }
    
    if (tetrisCard) {
        tetrisCard.addEventListener('mouseenter', () => preloadGame('tetris'));
    }
});
