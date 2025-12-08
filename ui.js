// ===================================
// UI RENDERING & UPDATES
// ===================================

function updateCurrentPlayerDisplay() {
    const player = getCurrentPlayer();
    
    document.getElementById('currentPlayerPiece').textContent = player.piece.icon;
    document.getElementById('currentPlayerName').textContent = player.name;
    document.getElementById('currentPlayerMoney').textContent = `$${player.money}`;
    
    // Update gems display
    const gemsContainer = document.getElementById('currentPlayerGems');
    gemsContainer.innerHTML = '';
    
    Object.keys(CATEGORIES).forEach(categoryKey => {
        const category = CATEGORIES[categoryKey];
        const gemCount = player.gems[categoryKey];
        const setCount = player.availableSets[categoryKey];
        
        const gemItem = document.createElement('div');
        gemItem.className = 'gem-item';
        
        const gemIcon = document.createElement('div');
        gemIcon.className = 'gem-icon';
        gemIcon.style.backgroundColor = category.color;
        gemIcon.textContent = category.icon;
        
        // Show set indicator if available
        if (setCount > 0) {
            const setIndicator = document.createElement('div');
            setIndicator.className = 'gem-set-indicator';
            setIndicator.textContent = setCount;
            gemIcon.appendChild(setIndicator);
        }
        
        const gemCountText = document.createElement('div');
        gemCountText.className = 'gem-count';
        gemCountText.textContent = gemCount;
        
        gemItem.appendChild(gemIcon);
        gemItem.appendChild(gemCountText);
        gemsContainer.appendChild(gemItem);
    });
    
    // Show/hide cash in button
    const cashInBtn = document.getElementById('cashInSetsBtn');
    if (hasAvailableSets(player)) {
        cashInBtn.style.display = 'block';
    } else {
        cashInBtn.style.display = 'none';
    }
}

function updateGameStatus(message) {
    document.getElementById('gameStatus').textContent = message;
}

function showQuestionModal(category, question) {
    const modal = document.getElementById('questionModal');
    const categoryInfo = CATEGORIES[category];
    
    // Set category header
    const categoryHeader = document.getElementById('questionCategory');
    categoryHeader.textContent = categoryInfo.name;
    categoryHeader.style.backgroundColor = categoryInfo.color;
    
    // Set question text
    document.getElementById('questionText').textContent = question.Question;
    
    const answerButtons = document.getElementById('answerButtons');
    answerButtons.innerHTML = '';
    
    // Check if multiple choice or autocomplete
    if (question.MultipleChoice && question.Choices) {
        // Show multiple choice buttons
        const options = generateAnswerOptions(question);
        
        options.forEach((option, index) => {
            // Create a wrapper div for each button to force new row
            const rowDiv = document.createElement('div');
            rowDiv.style.width = '100%';
            rowDiv.style.display = 'block';
            rowDiv.style.marginBottom = '15px';
            
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = option.text;
            btn.dataset.value = option.value;
            btn.onclick = () => handleAnswerClick(question, option.value, category);
            btn.style.width = '100%';
            btn.style.display = 'block';
            
            rowDiv.appendChild(btn);
            answerButtons.appendChild(rowDiv);
        });
    } else {
        // Show autocomplete input for open-ended questions
        showAutocompleteInput(question, category, answerButtons);
    }
    
    // Hide result section initially
    document.getElementById('questionResult').style.display = 'none';
    document.getElementById('answerButtons').style.display = 'block';
    
    modal.classList.add('active');
}

function showAutocompleteInput(question, category, container) {
    const wrapper = document.createElement('div');
    wrapper.className = 'autocomplete-wrapper';
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'autocomplete-input';
    input.placeholder = 'Start typing your answer...';
    input.autocomplete = 'off';
    
    const dropdown = document.createElement('div');
    dropdown.className = 'autocomplete-dropdown';
    dropdown.style.display = 'none';
    
    const submitBtn = document.createElement('button');
    submitBtn.className = 'autocomplete-submit';
    submitBtn.textContent = 'Submit Answer';
    submitBtn.disabled = true;
    
    // Filter and show suggestions as user types
    input.addEventListener('input', () => {
        const value = input.value.trim();
        
        if (value.length < 2) {
            dropdown.style.display = 'none';
            submitBtn.disabled = true;
            return;
        }
        
        // Filter answer pool
        const matches = answerPool.filter(answer => 
            answer.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 8); // Show top 8 matches
        
        if (matches.length > 0) {
            dropdown.innerHTML = '';
            matches.forEach(match => {
                const item = document.createElement('div');
                item.className = 'autocomplete-item';
                item.textContent = match;
                item.onclick = () => {
                    input.value = match;
                    dropdown.style.display = 'none';
                    submitBtn.disabled = false;
                };
                dropdown.appendChild(item);
            });
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
        
        // Enable submit if there's text
        submitBtn.disabled = value.length === 0;
    });
    
    // Submit on Enter key
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim().length > 0) {
            submitBtn.click();
        }
    });
    
    // Handle submit
    submitBtn.onclick = () => {
        const userAnswer = input.value.trim();
        if (userAnswer) {
            handleAutocompleteAnswer(question, userAnswer, category, input, submitBtn);
        }
    };
    
    wrapper.appendChild(input);
    wrapper.appendChild(dropdown);
    wrapper.appendChild(submitBtn);
    container.appendChild(wrapper);
    
    // Focus input
    setTimeout(() => input.focus(), 100);
}

function handleAutocompleteAnswer(question, userAnswer, category, input, submitBtn) {
    // Disable input and button
    input.disabled = true;
    submitBtn.disabled = true;
    
    // Check if answer is correct (case-insensitive comparison against accepted answers)
    const isCorrect = question.acceptedAnswers.some(accepted => 
        accepted.toLowerCase() === userAnswer.toLowerCase()
    );
    
    // Visual feedback on input
    input.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    // Show result after brief delay
    setTimeout(() => {
        showQuestionResult(isCorrect, question, category);
    }, 1000);
}

function handleAnswerClick(question, selectedValue, category) {
    const isCorrect = checkAnswer(question, selectedValue);
    
    // Disable all buttons
    const buttons = document.querySelectorAll('.answer-btn');
    buttons.forEach(btn => {
        btn.disabled = true;
        if (btn.dataset.value === selectedValue) {
            btn.classList.add(isCorrect ? 'correct' : 'incorrect');
        }
        // Highlight correct answer if wrong was selected
        if (!isCorrect && checkAnswer(question, btn.dataset.value)) {
            btn.classList.add('correct');
        }
    });
    
    // Show result after brief delay
    setTimeout(() => {
        showQuestionResult(isCorrect, question, category);
    }, 1000);
}

function showQuestionResult(isCorrect, question, category) {
    document.getElementById('answerButtons').style.display = 'none';
    
    const resultSection = document.getElementById('questionResult');
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');
    const resultBonus = document.getElementById('resultBonus');
    
    if (isCorrect) {
        resultIcon.textContent = '✅';
        resultText.textContent = 'Correct! You earned a gem! 💎';
        
        // Award gem
        const player = getCurrentPlayer();
        awardGem(player, category);
        updateCurrentPlayerDisplay();
    } else {
        resultIcon.textContent = '❌';
        resultText.textContent = 'Incorrect';
    }
    
    // Show bonus text if available
    if (question.AnswerBonus) {
        resultBonus.textContent = question.AnswerBonus;
    } else {
        resultBonus.textContent = `The correct answer is: ${question.Answer}`;
    }
    
    resultSection.style.display = 'block';
}

function closeQuestionModal() {
    const modal = document.getElementById('questionModal');
    modal.classList.remove('active');
    gameState.isQuestionActive = false;
}

function showCashInModal() {
    const player = getCurrentPlayer();
    const modal = document.getElementById('cashInModal');
    const optionsContainer = document.getElementById('cashInOptions');
    
    optionsContainer.innerHTML = '';
    
    let hasAnySets = false;
    
    Object.keys(CATEGORIES).forEach(categoryKey => {
        const availableSets = player.availableSets[categoryKey];
        if (availableSets > 0) {
            hasAnySets = true;
            const category = CATEGORIES[categoryKey];
            const config = GAME_CONFIG[gameState.mode];
            
            for (let i = 0; i < availableSets; i++) {
                const setOption = document.createElement('div');
                setOption.className = 'set-option';
                
                const setName = document.createElement('div');
                setName.className = 'set-name';
                setName.textContent = `${category.name} Set ${category.icon}`;
                setName.style.color = category.color;
                
                const setChoices = document.createElement('div');
                setChoices.className = 'set-choices';
                
                const moveBtn = document.createElement('button');
                moveBtn.className = 'set-choice-btn';
                moveBtn.textContent = `Move ${config.setRewards.moveSpaces} Spaces`;
                moveBtn.onclick = () => applyCashInChoice(categoryKey, 'move');
                
                const moneyBtn = document.createElement('button');
                moneyBtn.className = 'set-choice-btn';
                moneyBtn.textContent = `Earn $${config.setRewards.money}`;
                moneyBtn.onclick = () => applyCashInChoice(categoryKey, 'money');
                
                setChoices.appendChild(moveBtn);
                setChoices.appendChild(moneyBtn);
                
                setOption.appendChild(setName);
                setOption.appendChild(setChoices);
                optionsContainer.appendChild(setOption);
            }
        }
    });
    
    if (hasAnySets) {
        modal.classList.add('active');
    }
}

function applyCashInChoice(category, choice) {
    const player = getCurrentPlayer();
    const result = cashInSet(player, category, choice);
    
    if (result) {
        if (result.type === 'move') {
            // Will move after modal closes
            updateGameStatus(`${player.name} cashed in a set for ${result.spaces} spaces!`);
            setTimeout(() => {
                handlePlayerMove(result.spaces);
            }, 500);
        } else {
            updateGameStatus(`${player.name} earned $${result.amount}!`);
        }
        
        updateCurrentPlayerDisplay();
        
        // Refresh modal to show remaining sets
        closeCashInModal();
        if (hasAvailableSets(player)) {
            setTimeout(() => showCashInModal(), 300);
        }
    }
}

function closeCashInModal() {
    const modal = document.getElementById('cashInModal');
    modal.classList.remove('active');
}

function showResultsScreen() {
    const rankedPlayers = finalizeScores();
    
    document.getElementById('gameScreen').classList.remove('active');
    document.getElementById('resultsScreen').classList.add('active');
    
    const leaderboard = document.getElementById('leaderboard');
    leaderboard.innerHTML = '';
    
    rankedPlayers.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        if (index === 0) {
            item.classList.add('winner');
        }
        
        const rank = document.createElement('div');
        rank.className = 'rank';
        if (index === 0) {
            rank.innerHTML = '<span class="rank-icon">🏆</span>';
        } else if (index === 1) {
            rank.innerHTML = '<span class="rank-icon">🥈</span>';
        } else if (index === 2) {
            rank.innerHTML = '<span class="rank-icon">🥉</span>';
        } else {
            rank.textContent = `#${index + 1}`;
        }
        
        const pieceIcon = document.createElement('div');
        pieceIcon.style.fontSize = '2rem';
        pieceIcon.textContent = player.piece.icon;
        
        const info = document.createElement('div');
        info.className = 'player-result-info';
        
        const name = document.createElement('div');
        name.className = 'player-result-name';
        name.textContent = player.name;
        
        const money = document.createElement('div');
        money.className = 'player-result-money';
        money.textContent = `$${player.money}`;
        
        const gems = document.createElement('div');
        gems.className = 'player-result-gems';
        const totalGems = Object.values(player.gems).reduce((a, b) => a + b, 0);
        gems.textContent = `${totalGems} gems collected`;
        
        info.appendChild(name);
        info.appendChild(money);
        info.appendChild(gems);
        
        item.appendChild(rank);
        item.appendChild(pieceIcon);
        item.appendChild(info);
        
        leaderboard.appendChild(item);
    });
}

function showMilestoneRewardPopup(player, milestoneNum) {
    return new Promise((resolve) => {
        const modal = document.getElementById('questionModal');
        const categoryHeader = document.getElementById('questionCategory');
        const questionText = document.getElementById('questionText');
        const answerButtons = document.getElementById('answerButtons');
        const questionResult = document.getElementById('questionResult');
        
        // Milestone info
        const milestoneIcons = ['🏠 Port Town', '🏝️ Tropical Island', '🗼 Lighthouse', '🚢 Cruise Ship'];
        const milestoneColors = ['#6FB8E0', '#FF9C8E', '#C4A5D8', '#FFD700'];
        
        // Get payout info
        const orderIndex = gameState.milestoneArrivals[milestoneNum].indexOf(player.id);
        const payouts = GAME_CONFIG[gameState.mode].milestonePayout[milestoneNum];
        const playerPayout = payouts[orderIndex] || 0;
        const nextPayout = payouts[orderIndex + 1] || 0;
        
        // Set header
        categoryHeader.textContent = `Milestone ${milestoneNum} Reached!`;
        categoryHeader.style.backgroundColor = milestoneColors[milestoneNum - 1];
        
        // Set content
        questionText.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 20px;">${milestoneIcons[milestoneNum - 1]}</div>
            <div style="font-size: 1.8rem; margin-bottom: 10px; font-weight: 700;">${player.name} arrived!</div>
            <div style="font-size: 1.4rem; color: #FFD700; font-weight: 700;">+$${playerPayout}</div>
        `;
        
        // Set info in answer area
        answerButtons.innerHTML = '';
        const infoBox = document.createElement('div');
        infoBox.style.cssText = 'background: #f8f9fa; padding: 20px; border-radius: 12px; text-align: center;';
        
        if (nextPayout > 0) {
            infoBox.innerHTML = `
                <div style="font-size: 1.1rem; color: #666; margin-bottom: 10px;">Next player to arrive:</div>
                <div style="font-size: 1.3rem; font-weight: 700; color: #16213e;">Will earn $${nextPayout}</div>
            `;
        } else {
            infoBox.innerHTML = `
                <div style="font-size: 1.1rem; color: #666;">All rewards for this milestone have been claimed!</div>
            `;
        }
        
        const continueBtn = document.createElement('button');
        continueBtn.className = 'continue-btn';
        continueBtn.textContent = 'Continue →';
        continueBtn.style.marginTop = '20px';
        continueBtn.onclick = () => {
            modal.classList.remove('active');
            resolve();
        };
        
        answerButtons.appendChild(infoBox);
        answerButtons.appendChild(continueBtn);
        
        questionResult.style.display = 'none';
        answerButtons.style.display = 'block';
        
        modal.classList.add('active');
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}
