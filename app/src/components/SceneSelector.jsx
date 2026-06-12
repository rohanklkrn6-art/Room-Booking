import { useApp } from '../context/AppContext';

export default function SceneSelector() {
  const { state, dispatch } = useApp();
  return (
    <div className="scene-btns">
      <button
        className={`scene-btn${state.view === 'student' ? ' active' : ''}`}
        onClick={() => dispatch({ type: 'SET_VIEW', payload: 'student' })}
      >
        Student
      </button>
      <button
        className={`scene-btn${state.view === 'professor' ? ' active' : ''}`}
        onClick={() => dispatch({ type: 'SET_VIEW', payload: 'professor' })}
      >
        Professor
      </button>
    </div>
  );
}
