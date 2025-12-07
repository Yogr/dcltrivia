# 🎮 Enchanted Cruise Trivia - How to Run

## 📋 Quick Start

### Option 1: Using Python (Recommended)
1. Open a terminal/command prompt
2. Navigate to the game folder:
   ```bash
   cd c:\Users\y0oit\Documents\DCLTrivia
   ```
3. Start a local server:
   ```bash
   python -m http.server 8000
   ```
4. Open your browser and go to: `http://localhost:8000`

### Option 2: Using Node.js
1. Install the `http-server` package globally (first time only):
   ```bash
   npm install -g http-server
   ```
2. Navigate to the game folder and run:
   ```bash
   http-server -p 8000
   ```
3. Open your browser and go to: `http://localhost:8000`

### Option 3: Using VS Code Live Server
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html`
3. Select "Open with Live Server"

## 🚨 Important Notes

### Why You Need a Local Server
The game loads question files using `fetch()`, which requires a web server due to browser security (CORS policy). Simply opening `index.html` directly (`file://`) **will not work**.

### Screen Mirroring for TV
For the best family experience:
1. Start the game on your computer/tablet
2. Use screen mirroring to your TV:
   - **Windows**: Use "Project" feature (Win + P)
   - **Mac**: Use AirPlay
   - **Android/iOS**: Use built-in screen mirroring

## 🎯 Game Files Structure

```
DCLTrivia/
├── index.html              # Main HTML page
├── style.css               # All styling and animations
├── config.js               # Game configuration
├── state.js                # Game state management
├── board.js                # Board generation
├── questions.js            # Question handling
├── ui.js                   # UI updates
├── game.js                 # Game loop logic
├── app.js                  # Main entry point
├── disney_cruise_line.json # Category 1 questions
├── general_disney_trivia.json # Category 2 questions
├── disney_movie_quotes.json # Category 3 questions
├── disney_parks.json       # Category 4 questions
└── miscellaneous.json      # Category 5 questions
```

## 🎲 How to Play

1. **Setup**: Choose game mode (Quick or Grand Cruise)
2. **Players**: Select 2-4 players, enter names, choose pieces
3. **Gameplay**:
   - Roll the die to move
   - Answer trivia questions to earn gems
   - Collect 3 gems of the same color = 1 set
   - Cash in sets for movement or money
   - Reach milestones for bonus cash
4. **Win**: Player with the most money at the end wins!

## 🔧 Troubleshooting

### Questions Not Loading
- Make sure you're using a local server (see options above)
- Check browser console (F12) for errors
- Verify all `.json` files are in the same folder

### Game Not Starting
- Clear browser cache (Ctrl + Shift + Delete)
- Try a different browser
- Check that all `.js` files loaded correctly (browser console)

### Display Issues
- Zoom out if board is too large (Ctrl + Mouse Wheel)
- For mobile: rotate to landscape orientation
- Minimum recommended resolution: 1024x768

## 💡 Tips

- **TV Viewing**: Use large screen mode for better visibility
- **Quick Mode**: Perfect for families with young children (~20-30 min)
- **Grand Cruise**: Full experience for dedicated game night (~45-60 min)
- **Custom Questions**: You can edit the `.json` files to add your own questions!

## 🎨 Game Features

✅ Faux-3D board with CSS transforms  
✅ Animated dice rolling  
✅ Smooth piece movement  
✅ Gem collection system  
✅ Strategic set cash-in mechanic  
✅ Order-based milestone rewards  
✅ Beautiful magical theme  
✅ Responsive design (mobile, tablet, desktop)  
✅ No frameworks needed - pure vanilla JavaScript!  

## 📱 Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Internet Explorer (Not supported)

Enjoy your magical cruise adventure! 🚢✨
