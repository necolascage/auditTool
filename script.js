// Sample data structure with 2 pillars for POC
const pillars = [
    {
        id: 1,
        name: "Cognitive Load",
        questions: [
            {
                id: 1,
                text: "Ensure users clearly understand how to use the system",
                screens: 1,
                screenScores: [1],
                notApplicable: false
            },
            {
                id: 2,
                text: "Design and layout is consistent throughout the experience",
                screens: 1,
                screenScores: [1],
                notApplicable: false
            },
            {
                id: 3,
                text: "Apply familiar patterns for common tasks and interactions",
                screens: 1,
                screenScores: [1],
                notApplicable: false
            },
            {
                id: 4,
                text: "Headings, spacing, and typography are used to prioritize content",
                screens: 1,
                screenScores: [1],
                notApplicable: false
            }
        ]
    },
    {
        id: 2,
        name: "Visual Design",
        questions: [
            {
                id: 5,
                text: "Visual hierarchy guides user attention effectively",
                screens: 1,
                screenScores: [1],
                notApplicable: false
            },
            {
                id: 6,
                text: "Color usage supports brand identity and usability",
                screens: 1,
                screenScores: [1],
                notApplicable: false
            },
            {
                id: 7,
                text: "Typography is legible and appropriate for the content",
                screens: 1,
                screenScores: [1],
                notApplicable: false
            },
            {
                id: 8,
                text: "Spacing and alignment create visual harmony",
                screens: 1,
                screenScores: [1],
                notApplicable: false
            }
        ]
    }
];

// State management
let currentPillarIndex = 0;
let pillarScores = [];

// DOM Elements
const pillarForm = document.getElementById('pillar-form');
const resultsSection = document.getElementById('results-section');
const pillarCounter = document.getElementById('pillar-counter');
const pillarTitle = document.getElementById('pillar-title');
const progressFill = document.getElementById('progress-fill');
const questionsContainer = document.getElementById('questions-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const backToScoringBtn = document.getElementById('back-to-scoring');
const downloadCsvBtn = document.getElementById('download-csv');
const newAssessmentBtn = document.getElementById('new-assessment');
const pillarScoresContainer = document.getElementById('pillar-scores-container');

// Initialize the application
function init() {
    renderCurrentPillar();
    updateNavigationButtons();
    attachEventListeners();
}

// Render current pillar
function renderCurrentPillar() {
    const pillar = pillars[currentPillarIndex];
    
    // Update progress indicator
    pillarCounter.textContent = `Step ${currentPillarIndex + 1} of ${pillars.length}`;
    pillarTitle.textContent = pillar.name;
    progressFill.style.width = `${((currentPillarIndex + 1) / pillars.length) * 100}%`;
    
    // Render questions for this pillar
    questionsContainer.innerHTML = '';
    
    pillar.questions.forEach((question, questionIndex) => {
        renderQuestion(question, questionIndex);
    });
    
    // Update navigation buttons
    updateNavigationButtons();
}

// Render a single question
function renderQuestion(question, questionIndex) {
    const questionElement = document.createElement('div');
    questionElement.className = 'question';
    questionElement.dataset.questionIndex = questionIndex;
    
    // Calculate current question score
    const questionScore = calculateQuestionScore(question);
    
    questionElement.innerHTML = `
        <div class="question-header">
            <div class="question-text">${question.text}</div>
            <div class="toggle-container">
                <span>Does not apply</span>
                <label class="toggle-switch">
                    <input type="checkbox" class="not-applicable-toggle" 
                           ${question.notApplicable ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
        
        <div class="screens-section ${question.notApplicable ? 'hidden' : ''}">
            <div class="screens-header">
                <div class="screens-title">Audited screens or steps:</div>
                <div class="screens-count">
                    <input type="number" class="screens-input" 
                           min="1" max="10" value="${question.screens}">
                    <span>screens</span>
                </div>
            </div>
            
            <div class="screens-container">
                ${question.screenScores.map((score, screenIndex) => `
                    <div class="screen-item">
                        <div class="screen-header">Screen ${screenIndex + 1}</div>
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" class="score-radio" name="q${question.id}-screen-${screenIndex}"
                                       value="1" data-screen-index="${screenIndex}"
                                       ${score === 1 ? 'checked="checked"' : ''}>
                                <span>1 - Poor</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" class="score-radio" name="q${question.id}-screen-${screenIndex}"
                                       value="2" data-screen-index="${screenIndex}"
                                       ${score === 2 ? 'checked="checked"' : ''}>
                                <span>2 - Insufficient</span>
                            </label>
                            <label class="radio-label">
                                <input type="radio" class="score-radio" name="q${question.id}-screen-${screenIndex}"
                                       value="3" data-screen-index="${screenIndex}"
                                       ${score === 3 ? 'checked="checked"' : ''}>
                                <span>3 - Excellent</span>
                            </label>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="question-score ${question.notApplicable ? 'hidden' : ''}">
            <span class="question-score-label">Question score:</span>
            <span class="question-score-value">${questionScore.toFixed(2)}</span>
        </div>
    `;
    
    questionsContainer.appendChild(questionElement);
    
    // Attach event listeners for this question
    attachQuestionEventListeners(questionElement, questionIndex);
}

// Attach event listeners to a question
function attachQuestionEventListeners(questionElement, questionIndex) {
    const pillar = pillars[currentPillarIndex];
    const question = pillar.questions[questionIndex];

    // Set default checked state for radio buttons
    question.screenScores.forEach((score, screenIndex) => {
        const radioButtons = questionElement.querySelectorAll(`input[name="q${question.id}-screen-${screenIndex}"]`);
        radioButtons.forEach(radio => {
            radio.checked = (parseInt(radio.value) === score);
        });
    });

    // N/A toggle
    const naToggle = questionElement.querySelector('.not-applicable-toggle');
    naToggle.addEventListener('change', function() {
        question.notApplicable = this.checked;
        questionElement.querySelector('.screens-section').classList.toggle('hidden', this.checked);
        questionElement.querySelector('.question-score').classList.toggle('hidden', this.checked);
    });
    
    // Screens input
    const screensInput = questionElement.querySelector('.screens-input');
    screensInput.addEventListener('change', function() {
        const newScreenCount = parseInt(this.value);
        
        // Update screens count
        question.screens = newScreenCount;
        
        // Adjust screen scores array
        if (newScreenCount > question.screenScores.length) {
            // Add new screens with default score of 1
            while (question.screenScores.length < newScreenCount) {
                question.screenScores.push(1);
            }
        } else if (newScreenCount < question.screenScores.length) {
            // Remove excess screens
            question.screenScores = question.screenScores.slice(0, newScreenCount);
        }
        
        // Re-render this question
        renderCurrentPillar();
    });
    
    // Score radio changes
    questionElement.addEventListener('change', function(e) {
        if (e.target.classList.contains('score-radio')) {
            const screenIndex = parseInt(e.target.dataset.screenIndex);
            const newScore = parseInt(e.target.value);

            // Update score
            question.screenScores[screenIndex] = newScore;

            // Update question score display
            const questionScore = calculateQuestionScore(question);
            questionElement.querySelector('.question-score-value').textContent = questionScore.toFixed(2);
        }
    });
}

// Calculate score for a single question
function calculateQuestionScore(question) {
    if (question.notApplicable || question.screens === 0) {
        return 0;
    }
    
    const sum = question.screenScores.reduce((total, score) => total + score, 0);
    return sum / question.screens;
}

// Calculate score for current pillar
function calculatePillarScore() {
    const pillar = pillars[currentPillarIndex];
    let totalScore = 0;
    let applicableQuestions = 0;
    
    pillar.questions.forEach(question => {
        if (!question.notApplicable) {
            totalScore += calculateQuestionScore(question);
            applicableQuestions++;
        }
    });
    
    return applicableQuestions > 0 ? totalScore / applicableQuestions : 0;
}

// Update navigation buttons
function updateNavigationButtons() {
    // Update Back button
    prevBtn.disabled = currentPillarIndex === 0;
    
    // Update Next button
    if (currentPillarIndex === pillars.length - 1) {
        nextBtn.innerHTML = 'Calculate Score <i class="fas fa-calculator"></i>';
    } else {
        nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
    }
}

// Calculate all pillar scores
function calculateAllPillarScores() {
    pillarScores = [];
    
    pillars.forEach((pillar, index) => {
        let totalScore = 0;
        let applicableQuestions = 0;
        let pillarQuestions = [];
        
        pillar.questions.forEach(question => {
            if (!question.notApplicable) {
                const questionScore = calculateQuestionScore(question);
                totalScore += questionScore;
                applicableQuestions++;
                
                // Store question details for CSV export
                pillarQuestions.push({
                    text: question.text,
                    score: questionScore
                });
            }
        });
        
        const pillarScore = applicableQuestions > 0 ? totalScore / applicableQuestions : 0;
        pillarScores.push({
            name: pillar.name,
            score: pillarScore,
            questions: pillarQuestions
        });
    });
    
    return pillarScores;
}


// Show results
function showResults() {
    calculateAllPillarScores();
    renderResults();
    pillarForm.classList.add('hidden');
    resultsSection.classList.remove('hidden');
}

// Render results
function renderResults() {
    pillarScoresContainer.innerHTML = '';
    
    pillarScores.forEach(pillar => {
        // Create pillar header
        const pillarHeader = document.createElement('div');
        pillarHeader.className = 'pillar-score-header';
        pillarHeader.innerHTML = `
            <div class="pillar-name">${pillar.name}</div>
            <div class="pillar-score">${pillar.score.toFixed(2)}</div>
        `;
        pillarScoresContainer.appendChild(pillarHeader);
        
        // Create question details for this pillar
        const questionsList = document.createElement('div');
        questionsList.className = 'questions-list';
        
        pillar.questions.forEach(question => {
            const questionItem = document.createElement('div');
            questionItem.className = 'question-item';
            questionItem.innerHTML = `
                <div class="question-text">${question.text}</div>
                <div class="question-score">${question.score.toFixed(2)}</div>
            `;
            questionsList.appendChild(questionItem);
        });
        
        pillarScoresContainer.appendChild(questionsList);
    });
}

// Download CSV
function downloadCSV() {
    if (pillarScores.length === 0) {
        alert('No scores to download. Please calculate scores first.');
        return;
    }
    
    let csvContent = "Pillar Name,Question Name,Question Score,Pillar Score\n";
    
    pillarScores.forEach(pillar => {
        // Add pillar name and pillar score row
        csvContent += `"${pillar.name}","","",${pillar.score.toFixed(2)}\n`;
        
        // Add each question for this pillar
        pillar.questions.forEach(question => {
            // Escape double quotes in question text by doubling them (CSV standard)
            const escapedQuestionText = question.text.replace(/"/g, '""');
            csvContent += `"","${escapedQuestionText}",${question.score.toFixed(2)},${pillar.score.toFixed(2)}\n`;
        });
        
        // Add a blank row for separation between pillars (optional)
        csvContent += `\n`;
    });
    
    // Remove the last extra blank row
    csvContent = csvContent.trim();
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ux-assessment-${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Create new assessment
function newAssessment() {
    if (confirm('Create a new assessment? Current progress will be lost.')) {
        // Reset pillars to initial state
        pillars.forEach(pillar => {
            pillar.questions.forEach(question => {
                question.screens = 1;
                question.screenScores = [1];
                question.notApplicable = false;
            });
        });
        
        currentPillarIndex = 0;
        pillarScores = [];
        
        renderCurrentPillar();
        pillarForm.classList.remove('hidden');
        resultsSection.classList.add('hidden');
    }
}

// Navigation functions
function goToNext() {
    if (currentPillarIndex < pillars.length - 1) {
        currentPillarIndex++;
        renderCurrentPillar();
    } else {
        showResults();
    }
}

function goToPrev() {
    if (currentPillarIndex > 0) {
        currentPillarIndex--;
        renderCurrentPillar();
    }
}

// Attach event listeners
function attachEventListeners() {
    // Navigation buttons
    nextBtn.addEventListener('click', goToNext);
    prevBtn.addEventListener('click', goToPrev);
    
    // Results section buttons
    backToScoringBtn.addEventListener('click', () => {
        pillarForm.classList.remove('hidden');
        resultsSection.classList.add('hidden');
    });
    
    downloadCsvBtn.addEventListener('click', downloadCSV);
    newAssessmentBtn.addEventListener('click', newAssessment);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);