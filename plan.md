# Analog Clock Learning App Development Plan

This revised plan provides comprehensive instructions for an LLM agent to build an interactive analog clock application for 5-year-olds learning to read time, with a focus on using the Puppeteer MCP server for robust testing and GitHub workflow integration.

## 1. Application Architecture

```
analog-clock-app/
├── src/
│   ├── components/
│   │   ├── Clock.jsx
│   │   ├── ClockFace.jsx
│   │   ├── HourHand.jsx
│   │   ├── MinuteHand.jsx
│   │   ├── ClockNumbers.jsx
│   │   ├── ModeSelector.jsx
│   │   ├── PracticeMode.jsx
│   │   ├── PlayMode.jsx
│   │   ├── TestMode.jsx
│   │   ├── DigitalDisplay.jsx
│   │   ├── SuccessAnimation.jsx
│   │   └── AudioFeedback.jsx
│   ├── hooks/
│   │   ├── useClockState.js
│   │   ├── usePlayMode.js
│   │   ├── usePracticeMode.js
│   │   └── useAccessibility.js
│   ├── utils/
│   │   ├── timeUtils.js
│   │   ├── angleCalculations.js
│   │   ├── difficultyLevels.js
│   │   └── audioUtils.js
│   ├── context/
│   │   ├── ClockContext.jsx
│   │   └── GameStateContext.jsx
│   ├── App.jsx
│   └── main.jsx
├── tests/
│   ├── unit/
│   │   ├── timeUtils.test.js
│   │   ├── angleCalculations.test.js
│   │   └── components/
│   │       └── Clock.test.jsx
│   ├── puppeteer/
│   │   ├── setup.js
│   │   ├── helpers.js
│   │   ├── screenshots/
│   │   ├── practice.test.js
│   │   ├── play.test.js
│   │   └── accessibility.test.js
│   └── mcp/
│       ├── server.js
│       ├── commands/
│       │   ├── clockInteractions.js
│       │   ├── verifyTime.js
│       │   └── testProgress.js
│       └── scripts/
│           ├── runAllTests.js
│           └── generateReport.js
├── public/
│   ├── sounds/
│   │   ├── success.mp3
│   │   ├── try-again.mp3
│   │   ├── hour-description.mp3
│   │   └── minute-description.mp3
│   ├── images/
│   │   ├── clock-face-backgrounds/
│   │   └── animations/
│   └── favicon.ico
├── .github/
│   └── workflows/
│       └── ci.yml
├── .gitignore
├── package.json
└── README.md
```

## 2. Technical Specifications

### Frontend Framework
- React 18 (with Vite for faster development)
- Tailwind CSS for styling
- React DnD for drag-and-drop functionality
- Framer Motion for smooth animations

### State Management
- React Context API for global state
- Custom hooks for mode-specific functionality
- LocalStorage for progress persistence

### Testing
- Jest for unit testing
- Puppeteer MCP server for E2E testing and automation
- React Testing Library for component testing

### Deployment & Version Control
- GitHub for source control
- GitHub Actions for CI/CD
- Automated testing before each commit

## 3. Core Components Implementation

### ClockFace Component
```jsx
const ClockFace = ({ children, size = 300, theme = 'default' }) => {
  const themes = {
    default: 'bg-white border-gray-800',
    colorful: 'bg-blue-50 border-blue-500',
    highContrast: 'bg-black border-yellow-400'
  };
  
  return (
    <div 
      data-testid="clock-face"
      className={`clock-face rounded-full ${themes[theme]} border-4 relative`}
      style={{ 
        width: `${size}px`, 
        height: `${size}px`,
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
      }}
    >
      {/* Clock ticks for minutes */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div 
          key={`tick-${i}`} 
          className={`absolute w-0.5 origin-bottom ${
            i % 5 === 0 ? 'bg-gray-800 h-3' : 'bg-gray-400 h-1'
          }`}
          style={{
            left: '50%',
            bottom: '50%',
            transform: `translateX(-50%) rotate(${i * 6}deg) translateY(-${size / 2 - 10}px)`
          }}
        />
      ))}
      {children}
    </div>
  );
};
```

### Clock Numbers Component with Accessibility
```jsx
const ClockNumbers = ({ size = 300, highlightHour = null, highlightMinute = null }) => {
  const radius = size / 2 - 30;
  
  return (
    <>
      {Array.from({ length: 12 }).map((_, i) => {
        const number = i === 0 ? 12 : i;
        const angle = (i * 30 - 90) * (Math.PI / 180);
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        const isHighlighted = number === highlightHour;
        
        return (
          <div 
            key={`number-${i}`}
            data-testid={`clock-number-${number}`}
            className={`absolute text-2xl font-bold ${
              isHighlighted ? 'text-red-500 animate-pulse' : 'text-gray-800'
            }`}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              transform: 'translate(-50%, -50%)'
            }}
            aria-label={`${number} o'clock`}
          >
            {number}
          </div>
        );
      })}
      
      {/* Minute markers (by 5) with optional highlighting */}
      {Array.from({ length: 12 }).map((_, i) => {
        const minutes = i * 5;
        const isHighlighted = minutes === highlightMinute;
        
        if (minutes === 0) return null; // Skip 0/60
        
        return (
          <div
            key={`minute-${minutes}`}
            data-testid={`minute-marker-${minutes}`}
            className={`absolute text-sm ${
              isHighlighted ? 'text-blue-500 font-bold' : 'text-gray-500'
            }`}
            style={{
              left: `calc(50% + ${radius * 0.8 * Math.cos((i * 30 - 90) * (Math.PI / 180))}px)`,
              top: `calc(50% + ${radius * 0.8 * Math.sin((i * 30 - 90) * (Math.PI / 180))}px)`,
              transform: 'translate(-50%, -50%)'
            }}
            aria-label={`${minutes} minutes`}
          >
            {minutes}
          </div>
        );
      })}
    </>
  );
};
```

### Enhanced Clock Hands Components
```jsx
const HourHand = ({ angle, isDraggable, onDrag, disabled = false }) => {
  const handleRef = useRef(null);
  
  // Handle drag functionality
  useEffect(() => {
    if (!isDraggable || !handleRef.current || disabled) return;
    
    const element = handleRef.current;
    let startAngle = 0;
    let startRotation = angle;
    
    const handleMouseDown = (e) => {
      e.preventDefault();
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };
    
    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
      const deltaAngle = currentAngle - startAngle;
      
      // Snap to hour positions (every 30 degrees)
      const snappedAngle = Math.round((startRotation + deltaAngle) / 30) * 30;
      
      onDrag(snappedAngle);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('touchstart', handleMouseDown, { passive: false });
    
    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('touchstart', handleMouseDown);
    };
  }, [angle, isDraggable, onDrag, disabled]);

  return (
    <div 
      ref={handleRef}
      data-testid="hour-hand"
      className={`hour-hand absolute bg-black rounded-full ${
        isDraggable && !disabled ? 'cursor-grab active:cursor-grabbing' : ''
      } ${disabled ? 'opacity-50' : 'opacity-100'}`}
      style={{
        width: '8px',
        height: '70px',
        left: 'calc(50% - 4px)',
        bottom: '50%',
        transformOrigin: 'bottom center',
        transform: `rotate(${angle}deg)`,
        zIndex: 20
      }}
      aria-label={`Hour hand at ${Math.round(angle / 30) || 12} o'clock`}
      tabIndex={isDraggable && !disabled ? 0 : -1}
      role={isDraggable && !disabled ? "slider" : "presentation"}
      aria-valuemin="1"
      aria-valuemax="12"
      aria-valuenow={Math.round(angle / 30) || 12}
    />
  );
};

const MinuteHand = ({ angle, isDraggable, onDrag, disabled = false }) => {
  // Similar implementation with minute-specific adjustments
  // Includes snap to 5-minute intervals for easier learning
  // ...
};
```

## 4. Mode Implementations

### Practice Mode
```jsx
const PracticeMode = () => {
  const [hourAngle, setHourAngle] = useState(0);
  const [minuteAngle, setMinuteAngle] = useState(0);
  const [digitalTime, setDigitalTime] = useState({ hours: 12, minutes: 0 });
  const [showDigital, setShowDigital] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const audioRef = useRef(null);
  
  // Calculate digital time whenever angles change
  useEffect(() => {
    const time = calculateTimeFromAngles(hourAngle, minuteAngle);
    setDigitalTime(time);
    
    // Clear any previous feedback
    if (feedback) {
      setTimeout(() => setFeedback(null), 2000);
    }
  }, [hourAngle, minuteAngle]);
  
  const handleHourDrag = (newAngle) => {
    setHourAngle(newAngle);
    playTickSound('hour');
  };
  
  const handleMinuteDrag = (newAngle) => {
    // Snap to 5-minute intervals for beginners
    const snappedAngle = Math.round(newAngle / 30) * 30;
    setMinuteAngle(snappedAngle);
    playTickSound('minute');
    
    // Also update hour hand slightly based on minute position
    const hourEffect = (snappedAngle / 360) * 30;
    setHourAngle(prev => {
      const hourBase = Math.floor(prev / 30) * 30;
      return hourBase + hourEffect;
    });
  };
  
  const readTimeAloud = () => {
    // Use prepared audio or speech synthesis
    const { hours, minutes } = digitalTime;
    const timeText = `${hours} ${hours === 1 ? 'hour' : 'hours'} and ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    
    // For pre-recorded audio
    if (audioRef.current) {
      audioRef.current.src = `/sounds/time-${hours}-${minutes}.mp3`;
      audioRef.current.play();
    }
    
    // Or with speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(timeText);
      utterance.rate = 0.8; // Slightly slower for children
      speechSynthesis.speak(utterance);
    }
    
    setFeedback(`That's ${hours}:${minutes.toString().padStart(2, '0')}!`);
  };
  
  return (
    <div className="practice-mode" data-testid="practice-mode">
      <h2 className="text-2xl mb-4 text-center">Practice Mode</h2>
      
      <div className="clock-container flex flex-col items-center">
        <ClockFace size={300}>
          <ClockNumbers 
            size={300} 
            highlightHour={digitalTime.hours}
            highlightMinute={digitalTime.minutes}
          />
          <HourHand 
            angle={hourAngle} 
            isDraggable={true} 
            onDrag={handleHourDrag} 
          />
          <MinuteHand 
            angle={minuteAngle} 
            isDraggable={true} 
            onDrag={handleMinuteDrag} 
          />
        </ClockFace>
        
        {showDigital && (
          <div className="digital-display mt-4 text-2xl font-mono">
            {digitalTime.hours}:{digitalTime.minutes.toString().padStart(2, '0')}
          </div>
        )}
        
        {feedback && (
          <div className="feedback mt-4 text-xl text-green-600 font-bold">
            {feedback}
          </div>
        )}
        
        <div className="controls mt-6 flex gap-4">
          <button 
            onClick={readTimeAloud}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
            data-testid="read-time-button"
          >
            Read Time
          </button>
          <button 
            onClick={() => setShowDigital(!showDigital)}
            className="bg-gray-200 px-4 py-2 rounded-lg"
            data-testid="toggle-digital-button"
          >
            {showDigital ? 'Hide Digital' : 'Show Digital'}
          </button>
        </div>
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};
```

## 5. Testing with Puppeteer MCP Server

### Two-Phase Testing Approach

#### Phase 1: Console Error Detection

```javascript
// tests/mcp/commands/consoleErrorDetection.js
const detectConsoleErrors = async (page, url) => {
  // Collect all console messages
  const consoleMessages = [];
  
  page.on('console', msg => consoleMessages.push({
    type: msg.type(),
    text: msg.text(),
    location: msg.location()
  }));
  
  // Navigate to the page
  await page.goto(url);
  await page.waitForNetworkIdle();
  
  // Filter for errors
  const errors = consoleMessages.filter(msg => msg.type === 'error');
  
  // Categorize errors
  const categorizedErrors = {
    syntaxErrors: errors.filter(err => err.text.includes('SyntaxError')),
    referenceErrors: errors.filter(err => err.text.includes('ReferenceError')),
    typeErrors: errors.filter(err => err.text.includes('TypeError')),
    networkErrors: errors.filter(err => err.text.includes('Failed to load')),
    promiseRejections: errors.filter(err => err.text.includes('Unhandled promise rejection')),
    customErrors: errors.filter(err => 
      !err.text.includes('SyntaxError') && 
      !err.text.includes('ReferenceError') && 
      !err.text.includes('TypeError') && 
      !err.text.includes('Failed to load') && 
      !err.text.includes('Unhandled promise rejection')
    )
  };
  
  return {
    total: errors.length,
    categorized: categorizedErrors,
    raw: errors
  };
};

module.exports = { detectConsoleErrors };
```

#### Phase 2: UI Testing

```javascript
// tests/mcp/commands/visualTesting.js
const captureScreenshots = async (page, url, viewports) => {
  const screenshots = [];
  
  for (const viewport of viewports) {
    await page.setViewport(viewport);
    await page.goto(url);
    await page.waitForNetworkIdle();
    
    const screenshotPath = `./tests/puppeteer/screenshots/${viewport.width}x${viewport.height}_${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    screenshots.push({
      viewport,
      path: screenshotPath,
      timestamp: new Date().toISOString()
    });
  }
  
  return screenshots;
};

const testInteractions = async (page, url, interactions) => {
  await page.goto(url);
  await page.waitForNetworkIdle();
  
  const results = [];
  
  for (const interaction of interactions) {
    try {
      switch (interaction.type) {
        case 'click':
          await page.click(interaction.selector);
          break;
        case 'type':
          await page.type(interaction.selector, interaction.value);
          break;
        case 'select':
          await page.select(interaction.selector, interaction.value);
          break;
        case 'drag':
          // Custom implementation for analog clock hands
          const element = await page.$(interaction.selector);
          const box = await element.boundingBox();
          
          await page.mouse.move(
            box.x + box.width / 2, 
            box.y + box.height / 2
          );
          await page.mouse.down();
          await page.mouse.move(
            interaction.targetX, 
            interaction.targetY, 
            { steps: 10 }
          );
          await page.mouse.up();
          break;
      }
      
      // Wait for any resulting navigation or network activity
      await page.waitForNetworkIdle();
      
      // Capture result
      const screenshotPath = `./tests/puppeteer/screenshots/interaction_${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath });
      
      results.push({
        interaction,
        success: true,
        screenshotPath,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      results.push({
        interaction,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
};

module.exports = { captureScreenshots, testInteractions };
```

### MCP Server Setup

```javascript
// tests/mcp/server.js
const { chromium } = require('playwright');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import command handlers
const { detectConsoleErrors } = require('./commands/consoleErrorDetection');
const { captureScreenshots, testInteractions } = require('./commands/visualTesting');
const clockInteractions = require('./commands/clockInteractions');
const verifyTime = require('./commands/verifyTime');
const testProgress = require('./commands/testProgress');

const app = express();
app.use(cors());
app.use(bodyParser.json());

let browser;
let context;
let page;

async function initBrowser() {
  browser = await chromium.launch();
  context = await browser.newContext();
  page = await context.newPage();
  return { browser, context, page };
}

// Initialize browser when server starts
initBrowser().then(({ page }) => {
  console.log('Browser initialized');
  
  // Phase 1: Console Error Detection
  app.post('/detectConsoleErrors', async (req, res) => {
    try {
      const { url } = req.body;
      const errors = await detectConsoleErrors(page, url);
      res.json({ success: true, errors });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // Phase 2: UI Testing
  app.post('/captureScreenshots', async (req, res) => {
    try {
      const { url, viewports } = req.body;
      const screenshots = await captureScreenshots(page, url, viewports);
      res.json({ success: true, screenshots });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.post('/testInteractions', async (req, res) => {
    try {
      const { url, interactions } = req.body;
      const results = await testInteractions(page, url, interactions);
      res.json({ success: true, results });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  // Clock-specific commands
  app.post('/rotateHourHand', async (req, res) => {
    try {
      const { hours, minutes } = req.body;
      const result = await clockInteractions.rotateHourHand(page, hours, minutes);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.post('/rotateMinuteHand', async (req, res) => {
    try {
      const { minutes } = req.body;
      const result = await clockInteractions.rotateMinuteHand(page, minutes);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.post('/verifyClockTime', async (req, res) => {
    try {
      const { expectedHours, expectedMinutes } = req.body;
      const result = await verifyTime.verifyClockTime(page, expectedHours, expectedMinutes);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.post('/runAllTests', async (req, res) => {
    try {
      const result = await testProgress.runAllTests(page);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });
  
  app.listen(3030, () => {
    console.log('Puppeteer MCP Server running on http://localhost:3030');
  });
}).catch(error => {
  console.error('Failed to initialize browser:', error);
  process.exit(1);
});
```

### Comprehensive Test Runner Script

```javascript
// tests/mcp/scripts/runAllTests.js
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const MCP_SERVER_URL = 'http://localhost:3030';
const APP_URL = 'http://localhost:3000';

const VIEWPORTS = [
  { width: 1920, height: 1080, name: 'desktop' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 375, height: 667, name: 'mobile' }
];

const TEST_INTERACTIONS = {
  practiceMode: [
    { type: 'click', selector: '[data-testid="practice-mode-button"]', description: 'Switch to Practice Mode' },
    { type: 'drag', selector: '[data-testid="hour-hand"]', targetX: 200, targetY: 150, description: 'Move Hour Hand to 3:00' },
    { type: 'drag', selector: '[data-testid="minute-hand"]', targetX: 150, targetY: 100, description: 'Move Minute Hand to 3:15' },
    { type: 'click', selector: '[data-testid="read-time-button"]', description: 'Click Read Time button' }
  ],
  playMode: [
    { type: 'click', selector: '[data-testid="play-mode-button"]', description: 'Switch to Play Mode' },
    { type: 'click', selector: '[data-testid="easy-button"]', description: 'Select Easy difficulty' },
    { type: 'drag', selector: '[data-testid="hour-hand"]', targetX: 200, targetY: 150, description: 'Set hour hand for challenge' },
    { type: 'drag', selector: '[data-testid="minute-hand"]', targetX: 150, targetY: 100, description: 'Set minute hand for challenge' },
    { type: 'click', selector: '[data-testid="check-answer-button"]', description: 'Check answer' }
  ]
};

async function runAllTests() {
  console.log('Starting comprehensive test suite...');
  
  // Create screenshots directory if it doesn't exist
  const screenshotsDir = path.join(__dirname, '../../puppeteer/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }
  
  // Step 1: Console Error Detection
  console.log('Phase 1: Detecting console errors...');
  const consoleResponse = await axios.post(`${MCP_SERVER_URL}/detectConsoleErrors`, { url: APP_URL });
  
  if (consoleResponse.data.errors.total > 0) {
    console.error('Console errors detected:');
    console.error(JSON.stringify(consoleResponse.data.errors, null, 2));
    return {
      success: false,
      phase: 'console-error-detection',
      errors: consoleResponse.data.errors,
      message: 'Critical console errors must be fixed before proceeding to UI testing'
    };
  }
  
  console.log('No console errors detected. Proceeding to UI testing...');
  
  // Step 2: Visual Rendering Tests
  console.log('Phase 2: Capturing screenshots across different viewports...');
  const screenshotsResponse = await axios.post(`${MCP_SERVER_URL}/captureScreenshots`, { 
    url: APP_URL, 
    viewports: VIEWPORTS 
  });
  
  console.log('Screenshots captured:');
  console.log(JSON.stringify(screenshotsResponse.data.screenshots, null, 2));
  
  // Step 3: Interaction Testing
  console.log('Phase 3: Testing user interactions in Practice Mode...');
  const practiceInteractionsResponse = await axios.post(`${MCP_SERVER_URL}/testInteractions`, {
    url: APP_URL,
    interactions: TEST_INTERACTIONS.practiceMode
  });
  
  console.log('Practice Mode interactions tested:');
  console.log(JSON.stringify(practiceInteractionsResponse.data.results, null, 2));
  
  console.log('Phase 4: Testing user interactions in Play Mode...');
  const playInteractionsResponse = await axios.post(`${MCP_SERVER_URL}/testInteractions`, {
    url: APP_URL,
    interactions: TEST_INTERACTIONS.playMode
  });
  
  console.log('Play Mode interactions tested:');
  console.log(JSON.stringify(playInteractionsResponse.data.results, null, 2));
  
  // Generate summary report
  const allTestsPassed = 
    practiceInteractionsResponse.data.results.every(result => result.success) &&
    playInteractionsResponse.data.results.every(result => result.success);
  
  return {
    success: allTestsPassed,
    consoleErrors: consoleResponse.data.errors,
    screenshots: screenshotsResponse.data.screenshots,
    practiceInteractions: practiceInteractionsResponse.data.results,
    playInteractions: playInteractionsResponse.data.results,
    timestamp: new Date().toISOString(),
    message: allTestsPassed ? 'All tests passed!' : 'Some tests failed. Check the results for details.'
  };
}

// Export for use by the MCP server
module.exports = { runAllTests };

// Allow running directly from command line
if (require.main === module) {
  runAllTests()
    .then(results => {
      console.log('Test Results:');
      console.log(JSON.stringify(results, null, 2));
      
      // Save results to file
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      fs.writeFileSync(
        path.join(__dirname, `../../puppeteer/test-results-${timestamp}.json`),
        JSON.stringify(results, null, 2)
      );
      
      process.exit(results.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test runner error:', error);
      process.exit(1);
    });
}
```

## 6. GitHub Integration

### .gitignore File
```
# Dependencies
node_modules/
.pnp/
.pnp.js

# Testing
/coverage
/tests/puppeteer/screenshots/
/tests/puppeteer/test-results-*.json

# Production build
/build
/dist

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local
.env

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.idea/
.vscode/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

### GitHub Workflow for CI
```yaml
# .github/workflows/ci.yml
name: Clock App CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Start development server
      run: npm run dev & npx wait-on http://localhost:3000
    
    - name: Start Puppeteer MCP server
      run: npx @modelcontextprotocol/server-puppeteer --port 3030 --screenshot-dir ./screenshots &
    
    - name: Wait for MCP server
      run: npx wait-on http://localhost:3030
    
    - name: Run all tests
      run: node tests/mcp/scripts/runAllTests.js
    
    - name: Upload screenshots and test results
      uses: actions/upload-artifact@v3
      with:
        name: test-artifacts
        path: |
          tests/puppeteer/screenshots/
          tests/puppeteer/test-results-*.json
```

### Pre-Commit Script
```javascript
// scripts/pre-commit.js
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Running pre-commit checks...');

try {
  // Step 1: Run unit tests
  console.log('Running unit tests...');
  execSync('npm test', { stdio: 'inherit' });
  
  // Step 2: Start development server if not running
  console.log('Ensuring development server is running...');
  
  let serverRunning = false;
  try {
    execSync('curl http://localhost:3000 --max-time 2 --silent', { stdio: 'ignore' });
    serverRunning = true;
  } catch (e) {
    console.log('Starting development server...');
    execSync('npm run dev &', { stdio: 'inherit' });
    
    // Wait for server to start
    execSync('npx wait-on http://localhost:3000 --timeout 30000', { stdio: 'inherit' });
  }
  
  // Step 3: Ensure MCP server is running
  console.log('Ensuring Puppeteer MCP server is running...');
  
  let mcpRunning = false;
  try {
    execSync('curl http://localhost:3030 --max-time 2 --silent', { stdio: 'ignore' });
    mcpRunning = true;
  } catch (e) {
    console.log('Starting Puppeteer MCP server...');
    execSync('npx @modelcontextprotocol/server-puppeteer --port 3030 --screenshot-dir ./screenshots &', { stdio: 'inherit' });
    
    // Wait for MCP server to start
    execSync('npx wait-on http://localhost:3030 --timeout 30000', { stdio: 'inherit' });
  }
  
  // Step 4: Run UI tests
  console.log('Running UI tests...');
  
  const result = execSync('node tests/mcp/scripts/runAllTests.js', { encoding: 'utf8' });
  
  // Parse test results
  const testResults = JSON.parse(result);
  
  if (!testResults.success) {
    console.error('UI tests failed. Fix the issues before committing.');
    console.error(testResults.message);
    process.exit(1);
  }
  
  console.log('All tests passed! Proceeding with commit...');
  process.exit(0);
  
} catch (error) {
  console.error('Error during pre-commit checks:', error.message);
  process.exit(1);
}
```

### Git Hooks Setup (package.json)
```json
{
  "name": "analog-clock-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:ui": "node tests/mcp/scripts/runAllTests.js",
    "prepare": "husky install"
  },
  "husky": {
    "hooks": {
      "pre-commit": "node scripts/pre-commit.js"
    }
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.15.0",
    "tailwindcss": "^3.3.3"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^14.0.0",
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "axios": "^1.4.0",
    "husky": "^8.0.3",
    "jest": "^29.6.2",
    "playwright": "^1.36.2",
    "vite": "^4.4.5",
    "wait-on": "^7.0.1"
  }
}
```

## 7. Implementation Schedule for LLM Agent with GitHub Integration

### Phase 1: Project Setup (Days 1-2)
1. Create GitHub repository
2. Set up React project with Vite
3. Configure Tailwind CSS
4. Create basic file structure
5. Set up testing framework
6. Set up Puppeteer MCP server
7. Set up GitHub Actions CI workflow
8. Create .gitignore file
9. Initial commit and push

### Phase 2: Core Components (Days 3-5)
1. Implement ClockFace component
2. Implement ClockNumbers component
3. Implement Hour and Minute Hands
4. Implement basic drag functionality
5. Create the time calculation utilities
6. Create unit tests for core components
7. Run tests and commit/push changes

### Phase 3: Practice Mode (Days 6-7)
1. Implement Practice Mode UI
2. Add digital time display
3. Implement hand rotation with state updates
4. Add audio feedback
5. Create unit and Puppeteer tests for Practice Mode
6. Run tests and commit/push changes

### Phase 4: Play Mode (Days 8-10)
1. Implement Play Mode UI with challenges
2. Add difficulty settings
3. Create hint system
4. Implement streak counter and animations
5. Create tests for Play Mode
6. Run tests and commit/push changes

### Phase 5: Test Mode (Days 11-12)
1. Implement Test Mode UI
2. Create scoring system
3. Implement progress tracking
4. Add reporting for parents/teachers
5. Create tests for Test Mode
6. Run tests and commit/push changes

### Phase 6: Accessibility (Days 13-14)
1. Implement keyboard navigation
2. Add screen reader support
3. Improve color contrast options
4. Add voice narration
5. Test with accessibility tools
6. Run tests and commit/push changes

### Phase 7: Polish and Testing (Days 15-16)
1. Add animations and sound effects
2. Optimize for different screen sizes
3. Implement comprehensive testing
4. Fix bugs and edge cases
5. Run tests and commit/push changes

### Phase 8: Documentation and Final Delivery (Day 17)
1. Create user documentation
2. Document code for future maintenance
3. Create testing documentation
4. Prepare release notes
5. Final tests and commit/push changes

## 8. LLM Development Workflow

For each development task, the LLM agent should follow this workflow:

1. **Implementation Phase**:
   - Understand requirements
   - Write or update code
   - Run unit tests locally
   - Fix any immediate issues

2. **Testing Phase**:
   - Run console error detection tests
   - Fix any console errors
   - Run UI visual tests
   - Fix any UI rendering issues
   - Run interaction tests
   - Fix any interaction issues

3. **Commit and Push Phase**:
   - Run the full test suite
   - Ensure all tests pass
   - Stage changes
   - Commit with descriptive message
   - Push to GitHub

4. **Report Phase**:
   - Summarize changes made
   - Report test results
   - Provide screenshots if relevant
   - Notify about any issues or considerations

### Example Workflow:

```
# Implementation Phase:
- Implemented ClockFace component
- Added clock ticks and styling
- Created basic unit tests

# Testing Phase:
- Ran console error detection: No errors found
- Ran visual tests at 3 viewport sizes: All passing
- Ran interaction tests: All passing

# Commit and Push Phase:
- Running full test suite before commit...
- All 15 tests passed
- Committed with message "Add ClockFace component with responsive design"
- Pushed to GitHub branch 'feature/clock-face'

# Report:
- ClockFace component is now complete
- Responsive across desktop, tablet, and mobile
- All tests passing
- Available to view at http://localhost:3000
```

This comprehensive plan provides a structured approach for an LLM agent to build a high-quality, accessible, and educational clock application for young learners while maintaining code quality through rigorous testing and version control.