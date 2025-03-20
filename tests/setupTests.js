// Mock for window.matchMedia
window.matchMedia = window.matchMedia || function(query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {},
    dispatchEvent: function() {}
  };
};

// Mock for localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock for Web Audio API
window.AudioContext = window.AudioContext || function() {
  return {
    createOscillator: function() {
      return {
        frequency: { value: 0 },
        connect: function() {},
        start: function() {},
        stop: function() {}
      };
    },
    createGain: function() {
      return {
        gain: { 
          value: 0,
          exponentialRampToValueAtTime: function() {}
        },
        connect: function() {}
      };
    },
    destination: {}
  };
};

// Mock for SpeechSynthesis
window.speechSynthesis = window.speechSynthesis || {
  speak: function() {}
};
window.SpeechSynthesisUtterance = window.SpeechSynthesisUtterance || function() {};

// Silence console.warn during tests
const originalWarn = console.warn;
console.warn = function(...args) {
  // If message is about localStorage or audio, silence it
  const message = args[0]?.toString() || '';
  if (message.includes('localStorage') || message.includes('audio') || message.includes('speech')) {
    return;
  }
  originalWarn.apply(console, args);
};