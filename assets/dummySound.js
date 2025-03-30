// A dummy sound that helps unlock the audio context on iOS and other mobile devices
var emptyAudio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbMAYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBggICAgICAgICAgICAgICAgICAgICAgICAgICgn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fn5+fv7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d0AAAAAAH0wAABkAAABtAARBQAAAEluZm8AAAAPAAAAAwAAAbMAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBwcHBw3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d3d0AAAAAAA==');

// If no real sound files are available, create dummy sounds using the Web Audio API
function createDummyAudio() {
    if (!correctSound.src.includes('correct.mp3') || !wrongSound.src.includes('wrong.mp3') || !popSound.src.includes('pop.mp3')) {
        console.log('Creating dummy sounds with Web Audio API');
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create a beep sound function
        function createBeepSound(frequency, duration, type, when = 0) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.type = type;
            oscillator.frequency.value = frequency;
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(audioContext.currentTime + when);
            
            // Fade out
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + when);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + when + duration);
            
            oscillator.stop(audioContext.currentTime + when + duration);
            
            return { oscillator, gainNode };
        }

        // Override play methods with Web Audio API sounds
        if (!correctSound.src.includes('correct.mp3')) {
            correctSound.play = function() {
                createBeepSound(880, 0.1, 'sine');
                createBeepSound(1318.5, 0.1, 'sine', 0.1);
                createBeepSound(1760, 0.2, 'sine', 0.2);
                return Promise.resolve();
            };
        }
        
        if (!wrongSound.src.includes('wrong.mp3')) {
            wrongSound.play = function() {
                createBeepSound(311.1, 0.2, 'square');
                createBeepSound(207.7, 0.2, 'square', 0.2);
                return Promise.resolve();
            };
        }
        
        if (!popSound.src.includes('pop.mp3')) {
            popSound.play = function() {
                const pop = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                pop.frequency.value = 600;
                pop.type = 'sine';
                pop.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Quick attack and decay for a pop sound
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
                
                pop.start();
                pop.stop(audioContext.currentTime + 0.15);
                
                return Promise.resolve();
            };
        }
    }
}

// Create dummy sounds if needed once the document is loaded
document.addEventListener('DOMContentLoaded', createDummyAudio);
