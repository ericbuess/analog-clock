import { useState } from 'react'
import ClockFace from './components/ClockFace'
import ModeSelector from './components/ModeSelector'
import PracticeMode from './components/PracticeMode'
import PlayMode from './components/PlayMode'
import './App.css'

function App() {
  const [mode, setMode] = useState('practice') // 'practice' or 'play'
  
  return (
    <div className="App bg-blue-50 min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-4">Clock Learning</h1>
      
      <ModeSelector currentMode={mode} onModeChange={setMode} />
      
      <div className="mt-8 w-full max-w-md">
        {mode === 'practice' ? (
          <PracticeMode />
        ) : (
          <PlayMode />
        )}
      </div>
    </div>
  )
}

export default App