# Analog Clock Learning App

An interactive educational application designed to help 5-year-olds learn to read analog clocks. This app provides both practice and play modes with an intuitive, child-friendly interface.

## Features

- **Interactive Clock**: Drag hour and minute hands to set the time
- **Practice Mode**: Freely explore the clock with digital time display and audio feedback
- **Play Mode**: Fun challenges to set specific times with difficulty levels
- **Accessibility Features**: High contrast mode, screen reader support, and audio narration
- **Child-Friendly UI**: Large, clear visuals and intuitive interactions designed for young learners
- **Animations**: Engaging visual feedback through animations
- **Cross-Device Support**: Works on desktops, tablets, and mobile devices

## Screenshots

*Screenshots will be added once the application is running.*

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/analog-clock.git
   cd analog-clock
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:3000`

## Usage

### Practice Mode

- Drag the hour and minute hands to set different times
- See the digital time display update in real-time
- Click "Read Time" to hear the time spoken aloud
- Use "Random Time" to set a random time for practice
- Toggle the digital display on or off to test your skills

### Play Mode

- Select a difficulty level (Easy, Medium, Hard, Expert)
- Try to set the clock to match the target time
- Click "Check Answer" to see if you're correct
- Use "Show Hint" if you need help
- Build a streak of correct answers to earn more points

## Educational Value

This application helps children develop the following skills:

- Understanding the concept of hours and minutes
- Reading analog clock faces
- Associating analog time with digital time
- Learning time-telling vocabulary (quarter past, half past, etc.)
- Fine motor skills through drag interactions

## Technologies Used

- React 18 with Hooks
- Vite for fast development
- Tailwind CSS for styling
- Framer Motion for animations
- Jest and Puppeteer for testing
- Web Speech API for voice narration

## Testing

Run the unit tests:
```bash
npm test
```

Run the UI tests (requires the app to be running on localhost:3000):
```bash
npm run test:ui
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Created for Asa and his classmates to learn how to read analog clocks
- Special thanks to Claude, an AI assistant by Anthropic, for help with development