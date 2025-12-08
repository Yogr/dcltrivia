// ===================================
// GAME LOOP & TURN LOGIC
// ===================================

async function handleDiceRoll() {
    if (gameState.isMoving || gameState.isQuestionActive) return;
    
    const player = getCurrentPlayer();
    if (player.hasFinished) return;
    
    const diceBtn = document.getElementById('diceBtn');
    diceBtn.disabled = true;
    
    // Play dice roll sound
    SoundManager.playSound('diceRoll');
    
    // Animate dice roll
    const diceIcon = diceBtn.querySelector('.dice-icon');
    let rolls = 0;
    const rollInterval = setInterval(() => {
        diceIcon.textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][Math.floor(Math.random() * 6)];
        rolls++;
        if (rolls >= 10) {
            clearInterval(rollInterval);
            const finalRoll = Math.floor(Math.random() * 6) + 1;
            diceIcon.textContent = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][finalRoll - 1];
            
            updateGameStatus(`${player.name} rolled a ${finalRoll}!`);
            
            setTimeout(() => {
                handlePlayerMove(finalRoll);
            }, 500);
        }
    }, 100);
}

async function handlePlayerMove(spaces) {
    const player = getCurrentPlayer();
    const oldPosition = player.position;
    const maxPosition = GAME_CONFIG[gameState.mode].totalTiles;
    
    // Calculate new position (cap at max)
    let newPosition = oldPosition + spaces;
    if (newPosition > maxPosition) {
        newPosition = maxPosition;
    }
    
    player.position = newPosition;
    
    // Animate movement
    await movePlayerPiece(player, oldPosition, newPosition);
    
    // Check for milestone crossings
    const crossedMilestones = checkMilestoneCrossing(player, oldPosition, newPosition);
    if (crossedMilestones.length > 0) {
        for (const milestoneNum of crossedMilestones) {
            await showMilestoneRewardPopup(player, milestoneNum);
        }
        updateCurrentPlayerDisplay();
    }
    
    // Check if game is over
    if (allPlayersFinished()) {
        setTimeout(() => {
            showResultsScreen();
        }, 2000);
        return;
    }
    
    // Ask question if not at start and not finished and not on milestone
    if (newPosition > 0 && !player.hasFinished) {
        const tile = getTileAtPosition(newPosition);
        if (tile && !tile.isMilestone) {
            // Add delay so players can see where they landed
            await new Promise(resolve => setTimeout(resolve, 1000));
            await askQuestion(tile.category);
        } else {
            // On milestone, no question - just end turn
            endTurn();
        }
    } else {
        endTurn();
    }
}

async function askQuestion(category) {
    gameState.isQuestionActive = true;
    
    const question = getRandomQuestion(category);
    
    if (!question) {
        updateGameStatus('No questions available for this category!');
        setTimeout(() => endTurn(), 1500);
        return;
    }
    
    showQuestionModal(category, question);
}

function endTurn() {
    const player = getCurrentPlayer();
    
    // Move to next player
    nextPlayer();
    
    updateCurrentPlayerDisplay();
    updateGameStatus(`${getCurrentPlayer().name}'s turn!`);
    
    // Update camera to focus on new player
    centerCameraOnCurrentPlayer();
    
    // Re-enable dice button
    const diceBtn = document.getElementById('diceBtn');
    diceBtn.disabled = false;
}

function showMilestoneAnimation(player, milestoneNum) {
    const milestoneIcons = ['🏠', '🏝️', '🗼', '🚢'];
    const icon = milestoneIcons[milestoneNum - 1];
    
    // Get the milestone arrival info to show payout
    const orderIndex = gameState.milestoneArrivals[milestoneNum].indexOf(player.id);
    const payout = GAME_CONFIG[gameState.mode].milestonePayout[milestoneNum][orderIndex];
    
    if (payout > 0) {
        updateGameStatus(`${player.name} reached ${icon} Milestone ${milestoneNum}! +$${payout}`);
    } else {
        updateGameStatus(`${player.name} reached ${icon} Milestone ${milestoneNum}!`);
    }
}
