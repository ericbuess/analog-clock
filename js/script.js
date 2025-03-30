// DOM Elements
const hourHand = document.querySelector('.hour-hand');
const minuteHand = document.querySelector('.minute-hand');
const hourMarksContainer = document.getElementById('hour-marks');
const optionsContainer = document.querySelector('.options-container');
const scoreElement = document.getElementById('score');
const feedbackMessage = document.getElementById('feedback-message');
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const popSound = document.getElementById('pop-sound');
const themeBtn = document.getElementById('theme-btn');
const confettiCanvas = document.getElementById('confetti-canvas');

// Game state
let currentTime = null;
let score = 0;
let optionsGenerated = false;
let difficulty = 1; // 1 = 15-minute increments, 2 = 5-minute increments

// Initialize the clock face with hour marks and numbers
function initializeClockFace() {
    for (let i = 1; i <= 12; i++) {
        // Create hour marks
        const mark = document.createElement('div');
        mark.className = 'hour-mark';
        mark.style.transform = `rotate(${i * 30}deg)`;
        hourMarksContainer.appendChild(mark);
        
        // Create hour numbers
        const number = document.createElement('div');
        number.className = 'hour-number';
        number.textContent = i;
        
        // Position the numbers around the clock
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = 100 + 85 * Math.cos(angle);
        const y = 100 + 85 * Math.sin(angle);
        
        number.style.left = `${x}px`;
        number.style.top = `${y}px`;
        
        hourMarksContainer.appendChild(number);
    }
}

// Set the clock hands to show a specific time
function setClockTime(hour, minute) {
    // Calculate the angles for the hour and minute hands
    const hourAngle = (hour % 12) * 30 + (minute / 60) * 30;
    const minuteAngle = minute * 6;
    
    // Apply the rotations to the clock hands
    hourHand.style.transform = `translateX(-50%) rotate(${hourAngle}deg)`;
    minuteHand.style.transform = `translateX(-50%) rotate(${minuteAngle}deg)`;
    
    // Update current time
    currentTime = { hour, minute };
}

// Generate a random time based on current difficulty
function generateRandomTime() {
    const hour = Math.floor(Math.random() * 12) + 1;
    let minute;
    
    if (difficulty === 1) {
        // Easier: 15-minute increments
        const minuteOptions = [0, 15, 30, 45];
        minute = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
    } else {
        // Harder: 5-minute increments
        const minuteOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
        minute = minuteOptions[Math.floor(Math.random() * minuteOptions.length)];
    }
    
    return { hour, minute };
}

// Format time to a readable string (e.g., "3:00", "2:30")
function formatTime(hour, minute) {
    return `${hour}:${minute.toString().padStart(2, '0')}`;
}

// Generate multiple choice options
function generateOptions() {
    optionsContainer.innerHTML = '';
    
    // Create the correct option
    const correctOption = formatTime(currentTime.hour, currentTime.minute);
    
    // Generate 3 incorrect options
    const options = [correctOption];
    
    while (options.length < 4) {
        const randomTime = generateRandomTime();
        const timeString = formatTime(randomTime.hour, randomTime.minute);
        
        if (!options.includes(timeString)) {
            options.push(timeString);
        }
    }
    
    // Shuffle the options
    options.sort(() => Math.random() - 0.5);
    
    // Create option buttons
    options.forEach(option => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        
        optionElement.addEventListener('click', () => checkAnswer(option));
        
        optionsContainer.appendChild(optionElement);
    });
    
    optionsGenerated = true;
}

// Check if the selected answer is correct
function checkAnswer(selectedOption) {
    if (!optionsGenerated) return;
    
    const options = document.querySelectorAll('.option');
    const correctOption = formatTime(currentTime.hour, currentTime.minute);
    let clickedOption = null;
    
    // Find the clicked option
    options.forEach(option => {
        if (option.textContent === selectedOption) {
            clickedOption = option;
        }
    });
    
    if (!clickedOption) return;
    
    // Handle correct answer
    if (selectedOption === correctOption) {
        clickedOption.classList.add('correct');
        score++;
        scoreElement.textContent = score;
        
        // Increase difficulty after 3 correct answers
        if (score === 3 && difficulty === 1) {
            difficulty = 2;
            showLevelUpMessage();
        }
        
        playCorrectSound();
        createConfetti();
        showFeedbackMessage();
        
        // Disable all options after a correct answer
        options.forEach(option => {
            option.style.pointerEvents = 'none';
        });
        
        optionsGenerated = false;
        
        // Auto-proceed to next question after a short delay
        setTimeout(() => {
            nextQuestion();
        }, 2500);
    } 
    // Handle wrong answer
    else {
        clickedOption.classList.add('wrong');
        playWrongSound();
        
        // Only disable the wrong option
        clickedOption.style.pointerEvents = 'none';
    }
}

// Show a message when leveling up to harder difficulty
function showLevelUpMessage() {
    const levelUpMessage = document.createElement('div');
    levelUpMessage.className = 'level-up-message';
    levelUpMessage.innerHTML = 'Level Up! <br>Now try with 5-minute increments!';
    document.body.appendChild(levelUpMessage);
    
    // Animate it in and out
    setTimeout(() => {
        levelUpMessage.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        levelUpMessage.classList.remove('show');
    }, 3000);
    
    setTimeout(() => {
        document.body.removeChild(levelUpMessage);
    }, 4000);
}

// Confetti animation
class Confetti {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.pieces = [];
        this.numberOfPieces = 200;
        this.colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', 
                      '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', 
                      '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        window.addEventListener('resize', () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        });
    }
    
    createPieces() {
        this.pieces = [];
        for (let i = 0; i < this.numberOfPieces; i++) {
            this.pieces.push({
                x: Math.random() * this.canvas.width,  // x-coordinate
                y: Math.random() * -this.canvas.height, // y-coordinate (start above canvas)
                size: Math.random() * 10 + 5,          // size
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                shape: Math.random() > 0.5 ? 'circle' : 'rect',
                speedX: Math.random() * 6 - 3,         // horizontal speed
                speedY: Math.random() * 3 + 2,         // vertical speed (positive = falling down)
                rotation: Math.random() * 360,         // rotation in degrees
                rotationSpeed: Math.random() * 10 - 5  // rotation speed
            });
        }
    }
    
    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        let stillActive = false;
        
        this.pieces.forEach(piece => {
            // Update position
            piece.x += piece.speedX;
            piece.y += piece.speedY;
            
            // Update rotation
            piece.rotation += piece.rotationSpeed;
            
            // Draw the piece
            this.ctx.save();
            this.ctx.fillStyle = piece.color;
            this.ctx.translate(piece.x, piece.y);
            this.ctx.rotate(piece.rotation * Math.PI / 180);
            
            if (piece.shape === 'circle') {
                this.ctx.beginPath();
                this.ctx.arc(0, 0, piece.size / 2, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.closePath();
            } else {
                this.ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
            }
            
            this.ctx.restore();
            
            // Check if any pieces are still within the canvas
            if (piece.y < this.canvas.height) {
                stillActive = true;
            }
        });
        
        // Continue animation if there are still active pieces
        if (stillActive) {
            requestAnimationFrame(() => this.update());
        } else {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    start() {
        this.createPieces();
        this.update();
    }
}

const confetti = new Confetti(confettiCanvas);

function createConfetti() {
    confetti.start();
    playPopSound();
}

// Show feedback message animation
function showFeedbackMessage() {
    feedbackMessage.classList.add('show');
    
    // Automatically hide after a few seconds
    setTimeout(() => {
        feedbackMessage.classList.remove('show');
    }, 2000);
}

// Play correct answer sound
function playCorrectSound() {
    try {
        correctSound.currentTime = 0;
        const playPromise = correctSound.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log('Sound play failed:', e);
                // Try playing the dummy sound to unblock audio
                emptyAudio.play().then(() => {
                    correctSound.play();
                }).catch(e => console.log('Even dummy sound failed:', e));
            });
        }
    } catch (e) {
        console.log('Error playing sound:', e);
    }
}

// Play pop sound for confetti
function playPopSound() {
    try {
        popSound.currentTime = 0;
        const playPromise = popSound.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log('Pop sound play failed:', e);
                // Try playing the dummy sound to unblock audio
                emptyAudio.play().then(() => {
                    popSound.play();
                }).catch(e => console.log('Even dummy sound failed:', e));
            });
        }
    } catch (e) {
        console.log('Error playing pop sound:', e);
    }
}

// Play wrong answer sound
function playWrongSound() {
    try {
        wrongSound.currentTime = 0;
        const playPromise = wrongSound.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                console.log('Sound play failed:', e);
                // Try playing the dummy sound to unblock audio
                emptyAudio.play().then(() => {
                    wrongSound.play();
                }).catch(e => console.log('Even dummy sound failed:', e));
            });
        }
    } catch (e) {
        console.log('Error playing sound:', e);
    }
}

// Toggle theme between light and dark
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', newTheme);
    
    // Save theme preference in localStorage
    localStorage.setItem('theme', newTheme);
}

// Set up the next question
function nextQuestion() {
    const randomTime = generateRandomTime();
    setClockTime(randomTime.hour, randomTime.minute);
    generateOptions();
}

// Initialize the game
function init() {
    // Apply saved theme if any
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    initializeClockFace();
    nextQuestion();
    
    // Pre-load and unlock audio
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('touchstart', unlockAudio, { once: true });
    
    // Event listeners
    themeBtn.addEventListener('click', toggleTheme);
}

// Unlock audio on mobile devices
function unlockAudio() {
    // Create and play a silent sound to unlock audio on mobile
    const silentSound = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbMAYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBggICAgICAgICAgICAgICAgICAgICAgICAgICgn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fv7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d0AAAAAAH0wAABkAAABtAARBQAAAEluZm8AAAAPAAAAAwAAAbMAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBw3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d0AAAAAAA==');
    silentSound.play().then(() => {
        console.log('Audio unlocked');
    }).catch(e => {
        console.log('Could not unlock audio:', e);
    });
    
    // Also try to preload the actual sounds
    emptyAudio.play().catch(() => {});
    try {
        correctSound.play().then(() => {
            correctSound.pause();
            correctSound.currentTime = 0;
        }).catch(() => {});
        
        wrongSound.play().then(() => {
            wrongSound.pause();
            wrongSound.currentTime = 0;
        }).catch(() => {});
        
        popSound.play().then(() => {
            popSound.pause();
            popSound.currentTime = 0;
        }).catch(() => {});
    } catch(e) {}
}

// Start the game when the page loads
window.addEventListener('load', init);