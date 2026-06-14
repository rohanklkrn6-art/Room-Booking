import { useApp } from '../context/AppContext';

export default function Toast({ message, show, showUndo }) {
  const { undo } = useApp();
  return (
    <div className={`toast${show ? ' show' : ''}${showUndo ? ' with-undo' : ''}`}>
      <span>{message}</span>
      {showUndo && (
        <button className="toast-undo" onClick={undo}>Undo</button>
      )}
    </div>
  );
}
