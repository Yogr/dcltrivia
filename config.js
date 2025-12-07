// ===================================
// GAME CONFIGURATION
// ===================================

const GAME_CONFIG = {
    quick: {
        totalTiles: 60,
        milestones: [8, 23, 38, 60],
        milestonePayout: {
            1: [40, 30, 20, 10],
            2: [60, 45, 30, 15],
            3: [80, 60, 40, 20],
            4: [120, 90, 60, 30]
        },
        setRewards: {
            moveSpaces: 4,
            money: 40
        }
    },
    regular: {
        totalTiles: 80,
        milestones: [12, 32, 52, 80],
        milestonePayout: {
            1: [60, 45, 30, 15],
            2: [90, 70, 50, 30],
            3: [120, 90, 60, 40],
            4: [180, 135, 90, 60]
        },
        setRewards: {
            moveSpaces: 6,
            money: 60
        }
    }
};

const CATEGORIES = {
    cruise: {
        name: "Disney Cruise Line",
        color: "#6FB8E0",
        file: "disney_cruise_line.json",
        icon: "🚢"
    },
    general: {
        name: "General Disney",
        color: "#FF9C8E",
        file: "general_disney_trivia.json",
        icon: "🎬"
    },
    quotes: {
        name: "Movie Quotes",
        color: "#C4A5D8",
        file: "disney_movie_quotes.json",
        icon: "💬"
    },
    parks: {
        name: "Disney Parks",
        color: "#5DBDA8",
        file: "disney_parks.json",
        icon: "🎢"
    },
    misc: {
        name: "Miscellaneous",
        color: "#F4D35E",
        file: "miscellaneous.json",
        icon: "✨"
    }
};

const PLAYER_PIECES = [
    { id: "star", icon: "⭐", color: "#FFD700" },
    { id: "shell", icon: "🐚", color: "#FFB6C1" },
    { id: "gem", icon: "💎", color: "#87CEEB" },
    { id: "compass", icon: "🧭", color: "#98D8C8" }
];

const MILESTONE_ICONS = ["🏠", "🏝️", "🗼", "🚢"];
