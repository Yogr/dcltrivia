// ===================================
// SOUND MANAGER
// ===================================

const SoundManager = {
    isMuted: true, // Default muted
    backgroundMusic: null,
    sounds: {},
    
    // Initialize sound system
    init() {
        // Load mute preference from localStorage
        const savedMute = localStorage.getItem('gameSound');
        this.isMuted = savedMute === null ? true : savedMute === 'muted';
        
        // Create audio elements
        this.backgroundMusic = new Audio('sounds/background-music.mp3');
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.3; // Background music quieter
        
        // Load all sound effects with base64 encoded data
        this.sounds = {
            diceRoll: this.createSound('sounds/dice-roll.mp3'),
            movePiece: this.createSound('sounds/move-piece.mp3'),
            correctAnswer: this.createSound('sounds/correct-answer.mp3'),
            incorrectAnswer: this.createSound('sounds/incorrect-answer.mp3'),
            gemEarned: this.createSound('sounds/gem-earned.mp3'),
            milestone: this.createSound('sounds/milestone.mp3'),
            cashIn: this.createSound('sounds/cash-in.mp3'),
            buttonClick: this.createSound('sounds/button-click.mp3'),
            gameStart: this.createSound('sounds/game-start.mp3'),
            victory: this.createSound('sounds/victory.mp3')
        };
        
        // Update toggle button
        this.updateToggleButton();
    },
    
    createSound(src) {
        const audio = new Audio(src);
        audio.volume = 0.5;
        return audio;
    },
    
    // Toggle sound on/off
    toggle() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('gameSound', this.isMuted ? 'muted' : 'unmuted');
        
        if (this.isMuted) {
            this.stopBackgroundMusic();
        } else {
            this.playBackgroundMusic();
        }
        
        this.updateToggleButton();
        this.playSound('buttonClick');
    },
    
    updateToggleButton() {
        const btn = document.getElementById('soundToggle');
        if (btn) {
            btn.textContent = this.isMuted ? '🔇' : '🔊';
            btn.setAttribute('aria-label', this.isMuted ? 'Unmute' : 'Mute');
        }
    },
    
    // Play background music
    playBackgroundMusic() {
        if (!this.isMuted && this.backgroundMusic) {
            this.backgroundMusic.play().catch(err => {
                console.log('Background music playback prevented:', err);
            });
        }
    },
    
    // Stop background music
    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    },
    
    // Play a sound effect
    playSound(soundName) {
        if (this.isMuted || !this.sounds[soundName]) return;
        
        // Clone the audio to allow overlapping plays
        const sound = this.sounds[soundName].cloneNode();
        sound.volume = this.sounds[soundName].volume;
        sound.play().catch(err => {
            console.log(`Sound ${soundName} playback prevented:`, err);
        });
    },
    
    // Play a sound with custom volume
    playSoundWithVolume(soundName, volume) {
        if (this.isMuted || !this.sounds[soundName]) return;
        
        const sound = this.sounds[soundName].cloneNode();
        sound.volume = volume;
        sound.play().catch(err => {
            console.log(`Sound ${soundName} playback prevented:`, err);
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SoundManager.init());
} else {
    SoundManager.init();
}
