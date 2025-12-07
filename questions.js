// ===================================
// QUESTION LOADING & MANAGEMENT
// ===================================

let answerPool = new Set();

async function loadAllQuestions() {
    const loadPromises = Object.keys(CATEGORIES).map(async (categoryKey) => {
        const category = CATEGORIES[categoryKey];
        try {
            const response = await fetch(category.file);
            if (!response.ok) throw new Error(`Failed to load ${category.file}`);
            const questions = await response.json();
            return { categoryKey, questions };
        } catch (error) {
            console.error(`Error loading ${category.file}:`, error);
            return { categoryKey, questions: [] };
        }
    });
    
    const results = await Promise.all(loadPromises);
    
    results.forEach(({ categoryKey, questions }) => {
        // Parse answers and add to pool
        questions.forEach(q => {
            if (!q.MultipleChoice) {
                const parsed = parseAnswer(q.Answer);
                q.acceptedAnswers = parsed;
                // Add all parsed answers to the pool
                parsed.forEach(ans => answerPool.add(ans));
            }
        });
        
        gameState.allQuestions[categoryKey] = questions;
        gameState.usedQuestions[categoryKey] = [];
    });
    
    // Convert to sorted array for better autocomplete
    answerPool = Array.from(answerPool).sort();
}

function parseAnswer(answer) {
    const accepted = [];
    
    // Always include the original answer
    accepted.push(answer.trim());
    
    // Split on " and " or " or "
    const andParts = answer.split(/\s+and\s+/i);
    const orParts = answer.split(/\s+or\s+/i);
    
    // If split on "and", both parts are correct individually
    if (andParts.length > 1) {
        andParts.forEach(part => {
            const cleaned = part.trim().replace(/[,;.]$/, '');
            if (cleaned && cleaned !== answer.trim()) {
                accepted.push(cleaned);
            }
        });
    }
    
    // If split on "or", either part is correct
    if (orParts.length > 1) {
        orParts.forEach(part => {
            const cleaned = part.trim().replace(/[,;.]$/, '');
            if (cleaned && cleaned !== answer.trim()) {
                accepted.push(cleaned);
            }
        });
    }
    
    // Handle comma-separated lists (e.g., "Flora, Fauna, and Merryweather")
    if (answer.includes(',')) {
        const commaParts = answer.split(',').map(p => p.trim().replace(/\s+and\s+/i, '').trim());
        commaParts.forEach(part => {
            const cleaned = part.replace(/[,;.]$/, '');
            if (cleaned && cleaned.length > 2 && cleaned !== answer.trim()) {
                accepted.push(cleaned);
            }
        });
    }
    
    // Remove duplicates and empty strings
    return [...new Set(accepted)].filter(a => a.length > 0);
}

function getRandomQuestion(category) {
    const allQs = gameState.allQuestions[category] || [];
    const usedQs = gameState.usedQuestions[category] || [];
    
    if (allQs.length === 0) {
        return null; // No questions available
    }
    
    // Get unused questions
    const unusedQs = allQs.filter(q => !usedQs.includes(q));
    
    // If all used, reset
    if (unusedQs.length === 0) {
        gameState.usedQuestions[category] = [];
        return allQs[Math.floor(Math.random() * allQs.length)];
    }
    
    // Get random unused question
    const question = unusedQs[Math.floor(Math.random() * unusedQs.length)];
    gameState.usedQuestions[category].push(question);
    
    return question;
}

function generateAnswerOptions(question) {
    if (question.MultipleChoice && question.Choices) {
        // Multiple choice question with provided choices
        const choices = question.Choices;
        return [
            { text: choices.A, value: 'A' },
            { text: choices.B, value: 'B' },
            { text: choices.C, value: 'C' },
            { text: choices.D, value: 'D' }
        ];
    } else {
        // Open-ended question - generate plausible wrong answers
        const correctAnswer = question.Answer;
        const wrongAnswers = generateWrongAnswers(question);
        
        // Combine and shuffle
        const allAnswers = [
            { text: correctAnswer, value: 'correct', isCorrect: true },
            ...wrongAnswers.map((text, i) => ({ text, value: `wrong${i}`, isCorrect: false }))
        ];
        
        return shuffleArray(allAnswers);
    }
}

function generateWrongAnswers(question) {
    // Generate 3 plausible but incorrect answers
    const correctAnswer = question.Answer;
    const wrongs = [];
    
    // Check if answer is a number
    if (!isNaN(correctAnswer)) {
        const num = parseInt(correctAnswer);
        wrongs.push(String(num + 1));
        wrongs.push(String(num - 1));
        wrongs.push(String(num + 5));
    }
    // Check if answer is a year
    else if (/^\d{4}$/.test(correctAnswer)) {
        const year = parseInt(correctAnswer);
        wrongs.push(String(year - 1));
        wrongs.push(String(year + 1));
        wrongs.push(String(year - 3));
    }
    // Generic text answers
    else {
        const genericWrongs = [
            "Walt Disney",
            "Mickey Mouse",
            "Roy Disney",
            "Snow White",
            "Cinderella",
            "Sleeping Beauty",
            "Disneyland",
            "Magic Kingdom",
            "Epcot",
            "The Lion King",
            "Beauty and the Beast",
            "Aladdin",
            "Frozen",
            "Toy Story",
            "Finding Nemo",
            "1955",
            "1971",
            "1998",
            "2001"
        ];
        
        // Filter out the correct answer and pick 3 random
        const filtered = genericWrongs.filter(w => 
            w.toLowerCase() !== correctAnswer.toLowerCase() &&
            !correctAnswer.toLowerCase().includes(w.toLowerCase())
        );
        
        while (wrongs.length < 3 && filtered.length > 0) {
            const idx = Math.floor(Math.random() * filtered.length);
            wrongs.push(filtered.splice(idx, 1)[0]);
        }
        
        // If still need more, add generic options
        while (wrongs.length < 3) {
            wrongs.push(`Option ${wrongs.length + 1}`);
        }
    }
    
    return wrongs.slice(0, 3);
}

function checkAnswer(question, selectedValue) {
    if (question.MultipleChoice && question.Choices) {
        // Multiple choice with A, B, C, D
        return selectedValue === question.Answer;
    } else {
        // Open-ended converted to multiple choice
        return selectedValue === 'correct';
    }
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
