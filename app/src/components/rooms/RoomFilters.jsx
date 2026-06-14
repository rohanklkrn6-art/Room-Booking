import { useApp } from '../../context/AppContext';

const BUILDINGS = [
  { key: 'all', label: 'All Buildings', sub: 'A · B · C' },
  { key: 'A',   label: 'Building A',    sub: 'Business' },
  { key: 'B',   label: 'Building B',    sub: 'CS' },
  { key: 'C',   label: 'Building C',    sub: 'Library' },
];

// Group-size buckets: user thinks "I need space for N people"
const CAP_BTNS = [
  { key: 'all', label: 'Any' },
  { key: 'xs',  label: '1–4' },
  { key: 's',   label: '5–8' },
  { key: 'l',   label: '9+' },
];

export default function RoomFilters() {
  const { state, dispatch } = useApp();
  const { rmSrch, rmBldg, rmAvail, rmCap } = state;

  return (
    <div className="rms-hdr">
      <div className="srch-wrap">
        <input
          className="srch-inp"
          placeholder="Search rooms…"
          value={rmSrch}
          onChange={e => dispatch({ type: 'SET_RM_SRCH', payload: e.target.value })}
        />
        {rmSrch && (
          <button
            className="srch-clr"
            onClick={() => dispatch({ type: 'SET_RM_SRCH', payload: '' })}
          >
            ×
          </button>
        )}
      </div>

      <div className="pill-row">
        {BUILDINGS.map(({ key, label, sub }) => (
          <button
            key={key}
            className={`pill${rmBldg === key ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'SET_RM_BLDG', payload: key })}
          >
            {label}
            <span className="pill-sub">{sub}</span>
          </button>
        ))}
      </div>

      <div className="avail-tabs">
        <div
          className={`avail-tab${rmAvail === 0 ? ' active' : ''}`}
          onClick={() => dispatch({ type: 'SET_RM_AVAIL', payload: 0 })}
        >
          Free now
        </div>
        <div
          className={`avail-tab${rmAvail === 1 ? ' active' : ''}`}
          onClick={() => dispatch({ type: 'SET_RM_AVAIL', payload: 1 })}
        >
          Free later today
        </div>
      </div>

      <div className="cap-row">
        <span className="cap-lbl">Group</span>
        {CAP_BTNS.map(({ key, label }) => (
          <button
            key={key}
            className={`cap-btn${rmCap === key ? ' active' : ''}`}
            onClick={() => dispatch({ type: 'SET_RM_CAP', payload: key })}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
