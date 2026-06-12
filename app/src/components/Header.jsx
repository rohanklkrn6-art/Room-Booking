import { useApp } from '../context/AppContext';

export default function Header({ title, isProf = false }) {
  const { dispatch } = useApp();

  return (
    <div className={`header${isProf ? ' hdr-prof' : ''}`}>
      <span
        className="hdr-icon"
        onClick={() => dispatch({ type: 'SHOW_TOAST', payload: 'Navigation menu coming soon' })}
      >
        ☰
      </span>
      <span className="hdr-title">{title}</span>
      <span
        className="hdr-icon"
        onClick={() => dispatch({ type: 'SHOW_TOAST', payload: 'Settings coming soon' })}
      >
        ⚙
      </span>
    </div>
  )
}
