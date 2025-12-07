// ===================================
// MAIN APPLICATION ENTRY POINT
// ===================================

let selectedMode = null;
let selectedPlayerCount = null;
let playerConfigurations = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await loadAllQuestions();
});

function setupEventListeners() {
    // Mode selection
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => selectMode(btn.dataset.mode));
    });
    
    // Player count selection
    document.querySelectorAll('.player-count-btn').forEach(btn => {
        btn.addEventListener('click', () => selectPlayerCount(parseInt(btn.dataset.count)));
    });
    
    // Start game button
    document.getElementById('startGameBtn').addEventListener('click', startGame);
    
    // Dice button
    document.getElementById('diceBtn').addEventListener('click', handleDiceRoll);
    
    // Cash in sets button
    document.getElementById('cashInSetsBtn').addEventListener('click', showCashInModal);
    
    // Modal buttons
    document.getElementById('continueBtn').addEventListener('click', () => {
        closeQuestionModal();
        endTurn();
    });
    
    document.getElementById('cashInDoneBtn').addEventListener('click', closeCashInModal);
    
    // Results screen buttons
    document.getElementById('playAgainBtn').addEventListener('click', playAgain);
    document.getElementById('mainMenuBtn').addEventListener('click', returnToMainMenu);
}

function selectMode(mode) {
    selectedMode = mode;
    
    // Update UI
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('selected');
    
    checkSetupComplete();
}

function selectPlayerCount(count) {
    selectedPlayerCount = count;
    
    // Update UI
    document.querySelectorAll('.player-count-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-count="${count}"]`).classList.add('selected');
    
    // Show player setup inputs
    showPlayerInputs(count);
    checkSetupComplete();
}

function showPlayerInputs(count) {
    const container = document.getElementById('playerInputs');
    const section = document.getElementById('playerSetupSection');
    
    container.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
        const row = document.createElement('div');
        row.className = 'player-input-row';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = `Player ${i + 1} Name`;
        input.dataset.playerIndex = i;
        input.addEventListener('input', checkSetupComplete);
        
        const pieceSelector = document.createElement('div');
        pieceSelector.className = 'piece-selector';
        
        PLAYER_PIECES.forEach(piece => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'piece-btn';
            btn.textContent = piece.icon;
            btn.dataset.pieceId = piece.id;
            btn.dataset.playerIndex = i;
            btn.addEventListener('click', () => selectPiece(i, piece));
            pieceSelector.appendChild(btn);
        });
        
        row.appendChild(input);
        row.appendChild(pieceSelector);
        container.appendChild(row);
    }
    
    section.style.display = 'block';
    playerConfigurations = new Array(count).fill(null).map(() => ({ name: '', piece: null }));
}

function selectPiece(playerIndex, piece) {
    // Check if piece already selected by another player
    const alreadySelected = playerConfigurations.some((config, idx) => 
        idx !== playerIndex && config.piece && config.piece.id === piece.id
    );
    
    if (alreadySelected) return;
    
    // Update configuration
    playerConfigurations[playerIndex].piece = piece;
    
    // Update UI
    document.querySelectorAll(`[data-player-index="${playerIndex}"].piece-btn`).forEach(btn => {
        btn.classList.remove('selected');
    });
    document.querySelector(`[data-player-index="${playerIndex}"][data-piece-id="${piece.id}"]`).classList.add('selected');
    
    // Disable this piece for other players
    updatePieceAvailability();
    checkSetupComplete();
}

function updatePieceAvailability() {
    const selectedPieceIds = playerConfigurations
        .filter(config => config.piece)
        .map(config => config.piece.id);
    
    document.querySelectorAll('.piece-btn').forEach(btn => {
        const pieceId = btn.dataset.pieceId;
        const playerIndex = parseInt(btn.dataset.playerIndex);
        const isSelectedByThisPlayer = playerConfigurations[playerIndex].piece?.id === pieceId;
        const isSelectedByOther = selectedPieceIds.includes(pieceId) && !isSelectedByThisPlayer;
        
        btn.disabled = isSelectedByOther;
    });
}

function checkSetupComplete() {
    const errorMsg = document.getElementById('setupError');
    errorMsg.textContent = '';
    
    if (!selectedMode || !selectedPlayerCount) {
        document.getElementById('startGameBtn').style.display = 'none';
        return;
    }
    
    // Check player names
    const inputs = document.querySelectorAll('#playerInputs input');
    inputs.forEach((input, i) => {
        const name = input.value.trim();
        if (playerConfigurations[i]) {
            playerConfigurations[i].name = name;
        }
    });
    
    // Validate all players have names and pieces
    const allValid = playerConfigurations.every(config => 
        config.name && config.name.trim().length > 0 && config.piece
    );
    
    if (allValid) {
        document.getElementById('startGameBtn').style.display = 'block';
    } else {
        document.getElementById('startGameBtn').style.display = 'none';
    }
}

async function startGame() {
    if (!selectedMode || !selectedPlayerCount || playerConfigurations.length === 0) {
        return;
    }
    
    // Initialize game state
    initializeGameState(selectedMode, playerConfigurations);
    
    // Generate board
    gameState.boardTiles = generateBoard(selectedMode);
    
    // Switch to game screen
    showScreen('gameScreen');
    
    // Render board and UI
    renderBoard();
    updateCurrentPlayerDisplay();
    updateGameStatus(`${getCurrentPlayer().name}'s turn! Roll the dice to begin!`);
}

function playAgain() {
    // Reset with same mode
    const mode = gameState.mode;
    const players = gameState.players.map(p => ({
        name: p.name,
        piece: p.piece
    }));
    
    initializeGameState(mode, players);
    gameState.boardTiles = generateBoard(mode);
    
    showScreen('gameScreen');
    renderBoard();
    updateCurrentPlayerDisplay();
    updateGameStatus(`${getCurrentPlayer().name}'s turn! Roll the dice to begin!`);
}

function returnToMainMenu() {
    // Reset everything
    selectedMode = null;
    selectedPlayerCount = null;
    playerConfigurations = [];
    
    // Clear selections
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelectorAll('.player-count-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('playerSetupSection').style.display = 'none';
    document.getElementById('startGameBtn').style.display = 'none';
    
    showScreen('setupScreen');
}
