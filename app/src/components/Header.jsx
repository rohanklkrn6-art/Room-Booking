import { useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function Header({ title, isProf = false }) {
  const { dispatch, resetToDefaults } = useApp();

  // Secret reset: tap the header title 5 times quickly in professor view.
  const tapCount = useRef(0);
  const tapTimer = useRef(null);
  function handleTitleTap() {
    if (!isProf) return;
    tapCount.current += 1;
    clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => { tapCount.current = 0; }, 1500);
    if (tapCount.current >= 5) {
      tapCount.current = 0;
      resetToDefaults();
    }
  }

  return (
    <div className={`header${isProf ? ' hdr-prof' : ''}`}>
      <span
        className="hdr-icon"
        onClick={() => dispatch({ type: 'SHOW_TOAST', payload: 'Navigation menu coming soon' })}
      >
        ☰
      </span>
      <span className="hdr-title" onClick={handleTitleTap} style={isProf ? { cursor: 'default', userSelect: 'none' } : {}}>
        {title}
      </span>
      <span
        className="hdr-icon"
        onClick={() => dispatch({ type: 'SHOW_TOAST', payload: 'Settings coming soon' })}
      >
        ⚙
      </span>
    </div>
  );
}
