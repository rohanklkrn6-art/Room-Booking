import { useApp } from '../../context/AppContext';
import { LECTS } from '../../data/lectures';
import TimetableGrid from './TimetableGrid';
import { computeLectureStatus, getTodayIndex } from '../../utils/time';

export default function TimetableView() {
  const { state, dispatch } = useApp();
  const { selDay, lstatus, wkOff, nowM } = state;

  const isToday  = wkOff === 0 && selDay === getTodayIndex() && getTodayIndex() !== -1;
  const cancelled = (LECTS[selDay] || []).filter(l =>
    computeLectureStatus(l, isToday, lstatus, nowM) === 'cancelled'
  );

  return (
    <div className="content">
      {cancelled.map(l => (
        <div
          key={l.id}
          className="alert"
          onClick={() => dispatch({ type: 'SHOW_FREE_ROOM', payload: l.room })}
        >
          <span><strong>{l.sub}</strong> cancelled · {l.room} now free</span>
          <span>→</span>
        </div>
      ))}
      <TimetableGrid />
    </div>
  );
}
