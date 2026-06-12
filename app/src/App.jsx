import { useEffect } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import PhoneShell from './components/PhoneShell'
import StatusBar from './components/StatusBar'
import Toast from './components/Toast'
import SceneSelector from './components/SceneSelector'
import StudentView from './components/student/StudentView'
import ProfessorView from './components/professor/ProfessorView'
import BottomNav from './components/BottomNav'
import BottomSheet from './components/BottomSheet'
import './App.css'

function ToastManager() {
  const { state, dispatch } = useApp()
  const { show, msg } = state.toast
  useEffect(() => {
    if (!show) return
    const t = setTimeout(() => dispatch({ type: 'HIDE_TOAST' }), 2200)
    return () => clearTimeout(t)
  }, [show, msg, dispatch])
  return <Toast message={msg} show={show} />
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
      <PhoneContent />
    </AppProvider>
  )
}

export default App
