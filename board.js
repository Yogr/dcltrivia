// ===================================
// BOARD GENERATION & RENDERING
// ===================================

function generateBoard(mode) {
    const config = GAME_CONFIG[mode];
    const tiles = [];
    const categories = Object.keys(CATEGORIES);
    
    for (let i = 1; i <= config.totalTiles; i++) {
        const isMilestone = config.milestones.includes(i);
        const milestoneIndex = isMilestone ? config.milestones.indexOf(i) + 1 : null;
        
        // Random category for each tile
        const category = categories[Math.floor(Math.random() * categories.length)];
        
        // Calculate tile position using a winding path
        const position = calculateTilePosition(i, config.totalTiles);
        
        tiles.push({
            index: i,
            category: category,
            isMilestone: isMilestone,
            milestoneIndex: milestoneIndex,
            x: position.x,
            y: position.y
        });
    }
    
    return tiles;
}

function calculateTilePosition(index, totalTiles) {
    // Create a winding S-curve path
    const tilesPerRow = 10;
    const tileSpacing = 60;
    const rowSpacing = 70;
    
    const row = Math.floor((index - 1) / tilesPerRow);
    const col = (index - 1) % tilesPerRow;
    
    // Alternate direction for each row (snake pattern)
    const actualCol = (row % 2 === 0) ? col : (tilesPerRow - 1 - col);
    
    const x = actualCol * tileSpacing + 50;
    const y = row * rowSpacing + 50;
    
    return { x, y };
}

function renderBoard() {
    const boardContainer = document.getElementById('boardContainer');
    boardContainer.innerHTML = '';
    
    // Render tiles
    gameState.boardTiles.forEach(tile => {
        const tileElement = document.createElement('div');
        tileElement.className = 'tile';
        tileElement.id = `tile-${tile.index}`;
        
        if (tile.isMilestone) {
            tileElement.classList.add('milestone');
            tileElement.textContent = MILESTONE_ICONS[tile.milestoneIndex - 1];
        } else {
            tileElement.textContent = tile.index;
        }
        
        tileElement.style.backgroundColor = CATEGORIES[tile.category].color;
        tileElement.style.left = tile.x + 'px';
        tileElement.style.top = tile.y + 'px';
        
        boardContainer.appendChild(tileElement);
    });
    
    // Render player pieces
    gameState.players.forEach(player => {
        renderPlayerPiece(player);
    });
    
    // Center camera on current player
    centerCameraOnCurrentPlayer();
}

function centerCameraOnCurrentPlayer() {
    const player = getCurrentPlayer();
    const boardWrapper = document.querySelector('.board-wrapper');
    const boardContainer = document.getElementById('boardContainer');
    
    if (!player || player.position === 0) {
        // Start view - close up at beginning
        boardContainer.style.transform = 'perspective(1200px) rotateX(45deg) rotateZ(180deg) scale(1.5) translate(200px, 100px)';
        return;
    }
    
    const tile = gameState.boardTiles[player.position - 1];
    if (!tile) return;
    
    // Calculate center position
    const wrapperWidth = boardWrapper.clientWidth || 900;
    const wrapperHeight = boardWrapper.clientHeight || 600;
    
    // Zoom level - REVERSE: closer at start, farther as game progresses
    const progressPercent = player.position / GAME_CONFIG[gameState.mode].totalTiles;
    const zoomLevel = 1.5 - (progressPercent * 0.3); // 1.5 to 1.2x zoom (decreases)
    
    // Calculate translation to center on player's CURRENT position
    // Since scale comes before translate in the transform, we need to account for scaling
    // To center the player, we move the board so the player tile is in the center of the viewport
    const translateX = ((wrapperWidth / 2) - tile.x) / zoomLevel;
    const translateY = ((wrapperHeight / 2) - tile.y) / zoomLevel;
    
    // Apply transform with smooth transition - rotated 180deg to flip view
    boardContainer.style.transition = 'transform 0.8s ease-out';
    boardContainer.style.transform = `
        perspective(1200px) 
        rotateX(45deg) 
        rotateZ(180deg) 
        scale(${zoomLevel}) 
        translate(${translateX}px, ${translateY}px)
    `;
}

function renderPlayerPiece(player) {
    const boardContainer = document.getElementById('boardContainer');
    
    // Remove existing piece if present
    const existingPiece = document.getElementById(`player-piece-${player.id}`);
    if (existingPiece) {
        existingPiece.remove();
    }
    
    // Create new piece
    const pieceElement = document.createElement('div');
    pieceElement.className = 'player-piece';
    pieceElement.id = `player-piece-${player.id}`;
    pieceElement.textContent = player.piece.icon;
    
    // Position at current tile
    const tile = gameState.boardTiles[player.position];
    if (tile) {
        const offset = calculatePieceOffset(player.id);
        pieceElement.style.left = (tile.x + offset.x) + 'px';
        pieceElement.style.top = (tile.y + offset.y) + 'px';
    } else {
        // Start position (before tile 0)
        pieceElement.style.left = '20px';
        pieceElement.style.top = '20px';
    }
    
    boardContainer.appendChild(pieceElement);
}

function calculatePieceOffset(playerId) {
    // Offset pieces slightly so they don't overlap on same tile
    const offsets = [
        { x: 0, y: 0 },
        { x: 15, y: 0 },
        { x: 0, y: 15 },
        { x: 15, y: 15 }
    ];
    return offsets[playerId % 4];
}

async function movePlayerPiece(player, fromPos, toPos) {
    gameState.isMoving = true;
    const pieceElement = document.getElementById(`player-piece-${player.id}`);
    
    if (!pieceElement) return;
    
    // Animate movement tile by tile
    for (let pos = fromPos + 1; pos <= toPos; pos++) {
        const tile = gameState.boardTiles[pos - 1];
        if (tile) {
            const offset = calculatePieceOffset(player.id);
            
            // Update player position for camera tracking
            player.position = pos;
            
            // Play movement sound
            SoundManager.playSound('movePiece');
            
            pieceElement.classList.add('moving');
            pieceElement.style.left = (tile.x + offset.x) + 'px';
            pieceElement.style.top = (tile.y + offset.y) + 'px';
            
            // Camera follows piece smoothly - FIXED to track current position
            centerCameraOnCurrentPlayer();
            
            // Wait for animation
            await new Promise(resolve => setTimeout(resolve, 300));
            pieceElement.classList.remove('moving');
        }
    }
    
    // Ensure final position is set
    player.position = toPos;
    
    // Final camera adjustment after movement completes
    await new Promise(resolve => setTimeout(resolve, 200));
    centerCameraOnCurrentPlayer();
    
    gameState.isMoving = false;
}

function getTileAtPosition(position) {
    return gameState.boardTiles[position - 1];
}
