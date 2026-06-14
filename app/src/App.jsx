import { useEffect, useRef } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import PhoneShell from './components/PhoneShell'
import StatusBar from './components/StatusBar'
import Toast from './components/Toast'
import SceneSelector from './components/SceneSelector'
import StudentView from './components/student/StudentView'
import ProfessorView from './components/professor/ProfessorView'
import BottomNav from './components/BottomNav'
import BottomSheet from './components/BottomSheet'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineBanner from './components/OfflineBanner'
import FirstLoadHint from './components/FirstLoadHint'
import './App.css'

function ToastManager() {
  const { state, dispatch } = useApp()
  const { show, msg, showUndo } = state.toast
  const timerRef = useRef(null)

  useEffect(() => {
    clearTimeout(timerRef.current)
    if (!show) return
    // Undo toasts stay visible for 5 s (matching the pending write timer)
    const delay = showUndo ? 5000 : 3000
    timerRef.current = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), delay)
    return () => clearTimeout(timerRef.current)
  }, [show, msg, showUndo, dispatch])

  return <Toast message={msg} show={show} showUndo={showUndo} />
}

function Ticker() {
  const { dispatch } = useApp()
  useEffect(() => {
    const t = setInterval(() => dispatch({ type: 'TICK' }), 60000)
    return () => clearInterval(t)
  }, [dispatch])
  return null
}

function PhoneContent() {
  const { state } = useApp()
  return (
    <PhoneShell>
      <StatusBar />
      {state.view === 'student'   && <StudentView />}
      {state.view === 'professor' && <ProfessorView />}
      <BottomNav />
      <BottomSheet />
      <OfflineBanner />
      <FirstLoadHint />
      <ToastManager />
      <Ticker />
    </PhoneShell>
  )
}

function App() {
  useEffect(() => { window.__hideSplash?.() }, [])
  return (
    <AppProvider>
      <SceneSelector />
      <ErrorBoundary>
        <PhoneContent />
      </ErrorBoundary>
    </AppProvider>
  )
}

export default App
