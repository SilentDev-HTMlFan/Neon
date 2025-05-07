// Game State
const player = document.querySelector('.player');
const gameContainer = document.querySelector('.game-container');
const healthDisplay = document.getElementById('health');
const scoreDisplay = document.getElementById('score');

let playerX = 50;
let health = 100;
let score = 0;
let isGameActive = true;
const activeProjectiles = [];
const activeEnemies = [];

// =====================
// Collision System
// =====================
function checkCollision(a, b) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    
    return !(
        aRect.right < bRect.left || 
        aRect.left > bRect.right || 
        aRect.bottom < bRect.top || 
        aRect.top > bRect.bottom
    );
}

function createExplosion(x, y) {
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;
    gameContainer.appendChild(explosion);
    setTimeout(() => explosion.remove(), 500);
}

// =====================
// Projectile System
// =====================
function fireProjectile() {
    const projectile = document.createElement('div');
    projectile.className = 'projectile';
    projectile.style.left = `${playerX + 25}px`;
    projectile.style.bottom = 'calc(20% + 25px)';
    gameContainer.appendChild(projectile);
    activeProjectiles.push(projectile);

    const moveProjectile = () => {
        if (!isGameActive || !projectile.parentElement) return;
        
        const currentLeft = parseInt(projectile.style.left);
        projectile.style.left = `${currentLeft + 15}px`;

        if (currentLeft > window.innerWidth) {
            projectile.remove();
            activeProjectiles.splice(activeProjectiles.indexOf(projectile), 1);
            return;
        }

        requestAnimationFrame(moveProjectile);
    };
    requestAnimationFrame(moveProjectile);
}

// =====================
// Enemy System (Fixed Movement)
// =====================
function spawnEnemy() {
    if (!isGameActive) return;
    
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.left = '100%'; // Start off-screen right
    enemy.style.bottom = '20%';
    gameContainer.appendChild(enemy);
    activeEnemies.push(enemy);

    let position = window.innerWidth; // Start at right edge
    const moveEnemy = () => {
        if (!isGameActive || !enemy.parentElement) return;

        position -= 3; // Move leftward
        enemy.style.left = `${position}px`;

        // Remove when completely off-screen left
        if (position < -enemy.offsetWidth) {
            enemy.remove();
            activeEnemies.splice(activeEnemies.indexOf(enemy), 1);
            return;
        }

        requestAnimationFrame(moveEnemy);
    };
    
    requestAnimationFrame(moveEnemy);
}

// =====================
// Core Game Loop
// =====================
function gameLoop() {
    if (!isGameActive) return;

    // Projectile-Enemy collisions
    activeProjectiles.forEach((projectile, pIdx) => {
        activeEnemies.forEach((enemy, eIdx) => {
            if (checkCollision(projectile, enemy)) {
                createExplosion(
                    enemy.getBoundingClientRect().left,
                    enemy.getBoundingClientRect().top
                );
                
                projectile.remove();
                enemy.remove();
                
                activeProjectiles.splice(pIdx, 1);
                activeEnemies.splice(eIdx, 1);
                
                score += 100;
                scoreDisplay.textContent = `SCORE: ${score}`;
            }
        });
    });

    // Player-Enemy collisions
    activeEnemies.forEach(enemy => {
        if (checkCollision(player, enemy)) {
            health = Math.max(0, health - 10);
            healthDisplay.textContent = `HEALTH: ${health}`;
            
            enemy.remove();
            activeEnemies.splice(activeEnemies.indexOf(enemy), 1);
            
            if (health <= 0) {
                isGameActive = false;
                alert(`GAME OVER! Score: ${score}`);
            }
        }
    });

    requestAnimationFrame(gameLoop);
}

// =====================
// Input Handling
// =====================
document.addEventListener('keydown', (e) => {
    if (!isGameActive) return;
    
    // Movement
    const speed = 20;
    if (['ArrowLeft', 'a'].includes(e.key)) {
        playerX = Math.max(0, playerX - speed);
    }
    if (['ArrowRight', 'd'].includes(e.key)) {
        playerX = Math.min(window.innerWidth - 50, playerX + speed);
    }
    player.style.left = `${playerX}px`;
    
    // Shooting
    if (e.code === 'Space') fireProjectile();
});

// =====================
// Initialize Game
// =====================
setInterval(spawnEnemy, 2000); // Spawn enemy every 2 seconds
gameLoop(); // Start collision detection loop