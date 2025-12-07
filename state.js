// ===================================
// GAME STATE MANAGEMENT
// ===================================

let gameState = {
    mode: null,
    currentPlayerIndex: 0,
    players: [],
    boardTiles: [],
    milestoneArrivals: { 1: [], 2: [], 3: [], 4: [] },
    usedQuestions: {},
    allQuestions: {},
    isQuestionActive: false,
    isMoving: false
};

function initializeGameState(mode, playerConfigs) {
    gameState.mode = mode;
    gameState.currentPlayerIndex = 0;
    gameState.players = playerConfigs.map((config, index) => ({
        id: index,
        name: config.name,
        piece: config.piece,
        position: 0,
        money: 0,
        gems: { cruise: 0, general: 0, quotes: 0, parks: 0, misc: 0 },
        completedSets: { cruise: 0, general: 0, quotes: 0, parks: 0, misc: 0 },
        availableSets: { cruise: 0, general: 0, quotes: 0, parks: 0, misc: 0 },
        milestonesCrossed: [false, false, false, false],
        hasFinished: false,
        finishOrder: null
    }));
    gameState.milestoneArrivals = { 1: [], 2: [], 3: [], 4: [] };
    gameState.usedQuestions = { cruise: [], general: [], quotes: [], parks: [], misc: [] };
    gameState.isQuestionActive = false;
    gameState.isMoving = false;
}

function getCurrentPlayer() {
    return gameState.players[gameState.currentPlayerIndex];
}

function nextPlayer() {
    do {
        gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    } while (getCurrentPlayer().hasFinished && !allPlayersFinished());
}

function allPlayersFinished() {
    return gameState.players.every(p => p.hasFinished);
}

function awardGem(player, category) {
    player.gems[category]++;
    
    // Calculate available sets (every 3 gems = 1 set)
    const totalSets = Math.floor(player.gems[category] / 3);
    player.availableSets[category] = totalSets - player.completedSets[category];
}

function cashInSet(player, category, choice) {
    if (player.availableSets[category] <= 0) return;
    
    player.completedSets[category]++;
    player.availableSets[category]--;
    
    const config = GAME_CONFIG[gameState.mode];
    
    if (choice === 'move') {
        return { type: 'move', spaces: config.setRewards.moveSpaces };
    } else {
        player.money += config.setRewards.money;
        return { type: 'money', amount: config.setRewards.money };
    }
}

function hasAvailableSets(player) {
    return Object.values(player.availableSets).some(count => count > 0);
}

function checkMilestoneCrossing(player, oldPosition, newPosition) {
    const milestones = GAME_CONFIG[gameState.mode].milestones;
    const crossed = [];
    
    milestones.forEach((milestonePos, index) => {
        if (oldPosition < milestonePos && newPosition >= milestonePos) {
            if (!player.milestonesCrossed[index]) {
                crossed.push(index + 1);
                awardMilestone(player, index + 1);
            }
        }
    });
    
    return crossed;
}

function awardMilestone(player, milestoneNum) {
    const arrivals = gameState.milestoneArrivals[milestoneNum];
    arrivals.push(player.id);
    
    const orderIndex = arrivals.length - 1;
    const payouts = GAME_CONFIG[gameState.mode].milestonePayout[milestoneNum];
    const payout = payouts[orderIndex] || 0;
    
    if (payout > 0) {
        player.money += payout;
    }
    
    player.milestonesCrossed[milestoneNum - 1] = true;
    
    // Check if reached final milestone
    if (milestoneNum === 4) {
        player.hasFinished = true;
        player.finishOrder = arrivals.length;
    }
    
    return payout;
}

function finalizeScores() {
    const config = GAME_CONFIG[gameState.mode];
    const setConversionValue = config.setRewards.money;
    
    gameState.players.forEach(player => {
        // Convert remaining sets to money
        Object.keys(player.availableSets).forEach(category => {
            const setsToConvert = player.availableSets[category];
            player.money += setsToConvert * setConversionValue;
        });
    });
    
    // Sort players by money (descending), then by finish order (ascending)
    return [...gameState.players].sort((a, b) => {
        if (b.money !== a.money) {
            return b.money - a.money;
        }
        // If tied on money, earlier finisher wins
        if (a.finishOrder !== null && b.finishOrder !== null) {
            return a.finishOrder - b.finishOrder;
        }
        return 0;
    });
}
