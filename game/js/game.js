/**
 * CARBON DASH - Endless Runner Game
 * Built with Phaser 3 for EcoQuest/EcoStellar
 * 
 * Game Flow:
 * 1. Player runs automatically
 * 2. Click/Tap to jump
 * 3. Avoid grey pollution obstacles
 * 4. Collect green energy orbs (+10 points each)
 * 5. Game speeds up over time
 * 6. Game over on collision → Show score & blockchain reward button
 */

// ============================================================================
// GAME CONFIGURATION
// ============================================================================

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-game',
    backgroundColor: '#87CEEB', // Sky blue
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 1000 },
            debug: false
        }
    },
    scene: [BootScene, PlayScene, GameOverScene]
};

// Initialize the game
const game = new Phaser.Game(config);

// Global game state (accessible from outside)
window.CarbonDash = {
    currentScore: 0,
    lastScore: 0,
    isPlaying: false
};

// ============================================================================
// BOOT SCENE - Load Assets
// ============================================================================

function BootScene() {
    this.scene = new Phaser.Scene('Boot');
    
    this.scene.preload = function() {
        // Create simple placeholder graphics using Graphics API
        // (No external image files needed!)
        
        // Loading text
        this.add.text(400, 300, 'Loading...', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);
    };
    
    this.scene.create = function() {
        // Create all sprite graphics programmatically
        createPlayerSprite(this);
        createObstacleSprite(this);
        createCollectibleSprite(this);
        createCloudSprite(this);
        createGroundTexture(this);
        
        // Start the main game
        this.scene.start('Play');
    };
    
    return this.scene;
}

// ============================================================================
// SPRITE GENERATION FUNCTIONS (No external images needed!)
// ============================================================================

function createPlayerSprite(scene) {
    const graphics = scene.add.graphics();
    
    // Draw simple robot character (32x48 pixels)
    graphics.fillStyle(0x00FF88, 1); // Green
    graphics.fillRect(0, 0, 32, 48);
    
    // Head
    graphics.fillStyle(0x00DD66, 1);
    graphics.fillCircle(16, 12, 10);
    
    // Eyes
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(12, 10, 3);
    graphics.fillCircle(20, 10, 3);
    
    // Generate texture
    graphics.generateTexture('player', 32, 48);
    graphics.destroy();
}

function createObstacleSprite(scene) {
    const graphics = scene.add.graphics();
    
    // Grey pollution cloud (60x40 pixels)
    graphics.fillStyle(0x666666, 0.8);
    graphics.fillCircle(20, 20, 20);
    graphics.fillCircle(40, 20, 20);
    graphics.fillCircle(30, 15, 18);
    
    graphics.generateTexture('obstacle', 60, 40);
    graphics.destroy();
}

function createCollectibleSprite(scene) {
    const graphics = scene.add.graphics();
    
    // Green energy orb (24x24 pixels)
    graphics.fillStyle(0x00FF00, 1);
    graphics.fillCircle(12, 12, 10);
    
    // Inner glow
    graphics.fillStyle(0x88FF88, 1);
    graphics.fillCircle(12, 12, 6);
    
    graphics.generateTexture('orb', 24, 24);
    graphics.destroy();
}

function createCloudSprite(scene) {
    const graphics = scene.add.graphics();
    
    // White fluffy cloud for background (100x40 pixels)
    graphics.fillStyle(0xFFFFFF, 0.7);
    graphics.fillCircle(25, 20, 20);
    graphics.fillCircle(50, 20, 25);
    graphics.fillCircle(75, 20, 20);
    
    graphics.generateTexture('cloud', 100, 40);
    graphics.destroy();
}

function createGroundTexture(scene) {
    const graphics = scene.add.graphics();
    
    // Green grass ground (800x60 pixels)
    graphics.fillStyle(0x228B22, 1);
    graphics.fillRect(0, 0, 800, 60);
    
    // Add some grass detail
    graphics.fillStyle(0x32CD32, 1);
    for (let i = 0; i < 40; i++) {
        graphics.fillRect(i * 20, 0, 10, 5);
    }
    
    graphics.generateTexture('ground', 800, 60);
    graphics.destroy();
}

// ============================================================================
// PLAY SCENE - Main Game
// ============================================================================

function PlayScene() {
    this.scene = new Phaser.Scene('Play');
    
    // Game state variables
    let player;
    let ground;
    let obstacles;
    let collectibles;
    let clouds;
    let scoreText;
    let score = 0;
    let gameSpeed = 200;
    let spawnTimer = 0;
    let isGameOver = false;
    
    this.scene.create = function() {
        // Reset game state
        score = 0;
        gameSpeed = 200;
        isGameOver = false;
        
        // Update global state
        window.CarbonDash.currentScore = 0;
        window.CarbonDash.isPlaying = true;
        
        // ========================================
        // PARALLAX BACKGROUND (Clouds)
        // ========================================
        clouds = this.add.group();
        
        // Create initial clouds
        for (let i = 0; i < 5; i++) {
            const cloud = this.add.image(
                Phaser.Math.Between(0, 800),
                Phaser.Math.Between(50, 200),
                'cloud'
            );
            cloud.setScale(Phaser.Math.FloatBetween(0.5, 1.0));
            cloud.setAlpha(0.6);
            clouds.add(cloud);
        }
        
        // ========================================
        // GROUND
        // ========================================
        ground = this.physics.add.staticGroup();
        ground.create(400, 570, 'ground').setScale(2).refreshBody();
        
        // ========================================
        // PLAYER
        // ========================================
        player = this.physics.add.sprite(150, 450, 'player');
        player.setBounce(0);
        player.setCollideWorldBounds(true);
        player.body.setSize(28, 44); // Smaller hitbox for fairness
        
        // Player collides with ground
        this.physics.add.collider(player, ground);
        
        // ========================================
        // OBSTACLES (Grey Pollution Clouds)
        // ========================================
        obstacles = this.physics.add.group();
        
        // ========================================
        // COLLECTIBLES (Green Energy Orbs)
        // ========================================
        collectibles = this.physics.add.group();
        
        // ========================================
        // COLLISIONS
        // ========================================
        
        // Hit obstacle = game over
        this.physics.add.overlap(player, obstacles, hitObstacle, null, this);
        
        // Collect orb = +10 points
        this.physics.add.overlap(player, collectibles, collectOrb, null, this);
        
        // ========================================
        // SCORE DISPLAY
        // ========================================
        scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            fill: '#fff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        });
        
        // ========================================
        // INPUT (Click/Tap to Jump)
        // ========================================
        this.input.on('pointerdown', () => {
            if (!isGameOver && player.body.touching.down) {
                player.setVelocityY(-500);
            }
        });
        
        // Keyboard support (spacebar)
        this.input.keyboard.on('keydown-SPACE', () => {
            if (!isGameOver && player.body.touching.down) {
                player.setVelocityY(-500);
            }
        });
        
        // ========================================
        // INSTRUCTIONS
        // ========================================
        const instructions = this.add.text(400, 100, 'Click or Tap to Jump!', {
            fontSize: '24px',
            fill: '#fff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Fade out after 3 seconds
        this.time.delayedCall(3000, () => {
            this.tweens.add({
                targets: instructions,
                alpha: 0,
                duration: 1000,
                onComplete: () => instructions.destroy()
            });
        });
    };
    
    this.scene.update = function(time, delta) {
        if (isGameOver) return;
        
        // ========================================
        // PARALLAX CLOUDS (Slow movement)
        // ========================================
        clouds.children.entries.forEach(cloud => {
            cloud.x -= 0.5;
            
            // Respawn cloud on the right when it goes off screen
            if (cloud.x < -100) {
                cloud.x = 900;
                cloud.y = Phaser.Math.Between(50, 200);
            }
        });
        
        // ========================================
        // SPAWN OBSTACLES & COLLECTIBLES
        // ========================================
        spawnTimer += delta;
        
        if (spawnTimer > 1500) { // Every 1.5 seconds
            spawnTimer = 0;
            
            // 70% chance to spawn obstacle, 30% chance to spawn orb
            if (Math.random() < 0.7) {
                spawnObstacle(this);
            } else {
                spawnCollectible(this);
            }
        }
        
        // ========================================
        // MOVE OBSTACLES & COLLECTIBLES
        // ========================================
        obstacles.children.entries.forEach(obstacle => {
            obstacle.x -= gameSpeed * (delta / 1000);
            
            // Remove if off screen
            if (obstacle.x < -100) {
                obstacle.destroy();
            }
        });
        
        collectibles.children.entries.forEach(orb => {
            orb.x -= gameSpeed * (delta / 1000);
            
            // Bobbing animation
            orb.y += Math.sin(time * 0.005) * 0.5;
            
            // Remove if off screen
            if (orb.x < -100) {
                orb.destroy();
            }
        });
        
        // ========================================
        // GRADUALLY INCREASE DIFFICULTY
        // ========================================
        gameSpeed += 0.01;
    };
    
    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    
    function spawnObstacle(scene) {
        const obstacle = obstacles.create(850, 510, 'obstacle');
        obstacle.setImmovable(true);
        obstacle.body.allowGravity = false;
    }
    
    function spawnCollectible(scene) {
        const orb = collectibles.create(
            850,
            Phaser.Math.Between(300, 450),
            'orb'
        );
        orb.setImmovable(true);
        orb.body.allowGravity = false;
    }
    
    function hitObstacle(player, obstacle) {
        if (isGameOver) return;
        
        isGameOver = true;
        
        // Update global state
        window.CarbonDash.lastScore = score;
        window.CarbonDash.isPlaying = false;
        
        // Stop physics
        scene.physics.pause();
        
        // Red tint on player
        player.setTint(0xff0000);
        
        // Go to game over scene
        scene.scene.start('GameOver', { score: score });
    }
    
    function collectOrb(player, orb) {
        // Add points
        score += 10;
        scoreText.setText('Score: ' + score);
        
        // Update global state
        window.CarbonDash.currentScore = score;
        
        // Visual feedback - orb grows and fades
        scene.tweens.add({
            targets: orb,
            scaleX: 2,
            scaleY: 2,
            alpha: 0,
            duration: 200,
            onComplete: () => orb.destroy()
        });
    }
    
    // Make scene object accessible for helper functions
    const scene = this.scene;
    
    return this.scene;
}

// ============================================================================
// GAME OVER SCENE
// ============================================================================

function GameOverScene() {
    this.scene = new Phaser.Scene('GameOver');
    
    this.scene.init = function(data) {
        this.finalScore = data.score || 0;
    };
    
    this.scene.create = function() {
        // Background overlay
        this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
        
        // ========================================
        // GAME OVER TEXT
        // ========================================
        this.add.text(400, 150, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        // ========================================
        // FINAL SCORE
        // ========================================
        this.add.text(400, 250, 'Final Score: ' + this.finalScore, {
            fontSize: '48px',
            fill: '#fff',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // ========================================
        // BLOCKCHAIN REWARD CALCULATION
        // ========================================
        const rewardTokens = Math.floor(this.finalScore / 10); // 10 points = 1 ECO token
        
        this.add.text(400, 320, `You earned: ${rewardTokens} ECO Tokens! 🌱`, {
            fontSize: '32px',
            fill: '#00FF88',
            fontStyle: 'bold',
            stroke: '#000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // ========================================
        // CLAIM REWARDS BUTTON (Blockchain Integration)
        // ========================================
        const claimButton = this.add.rectangle(400, 400, 300, 60, 0x00FF88);
        const claimText = this.add.text(400, 400, 'Claim Rewards', {
            fontSize: '28px',
            fill: '#000',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        claimButton.setInteractive({ useHandCursor: true });
        
        claimButton.on('pointerover', () => {
            claimButton.setFillStyle(0x00DD66);
        });
        
        claimButton.on('pointerout', () => {
            claimButton.setFillStyle(0x00FF88);
        });
        
        claimButton.on('pointerdown', () => {
            // TODO: Connect to Stellar/Soroban smart contract
            // This will call GameRewards.record_game_session(player, score)
            console.log('🎮 Claiming rewards...');
            console.log('Score:', this.finalScore);
            console.log('ECO Tokens to mint:', rewardTokens);
            
            alert(`🚀 Blockchain integration coming soon!\n\nYour score: ${this.finalScore}\nECO Tokens: ${rewardTokens}\n\nThis will call the GameRewards smart contract.`);
        });
        
        // ========================================
        // PLAY AGAIN BUTTON
        // ========================================
        const playButton = this.add.rectangle(400, 490, 300, 60, 0x4169E1);
        const playText = this.add.text(400, 490, 'Play Again', {
            fontSize: '28px',
            fill: '#fff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        playButton.setInteractive({ useHandCursor: true });
        
        playButton.on('pointerover', () => {
            playButton.setFillStyle(0x1E90FF);
        });
        
        playButton.on('pointerout', () => {
            playButton.setFillStyle(0x4169E1);
        });
        
        playButton.on('pointerdown', () => {
            this.scene.start('Play');
        });
    };
    
    return this.scene;
}
