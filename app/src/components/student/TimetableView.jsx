import { useApp } from '../../context/AppContext';
import { LECTS } from '../../data/lectures';
import TimetableGrid from './TimetableGrid';
import { computeLectureStatus, getTodayIndex, isExamPeriod, isSemesterOver } from '../../utils/time';

export default function TimetableView() {
  const { state, dispatch } = useApp();
  const { selDay, lstatus, wkOff, nowM } = state;

  const isToday = wkOff === 0 && selDay === getTodayIndex();

  if (isSemesterOver(wkOff, selDay)) {
    return (
      <div className="content">
        <div className="no-res" style={{ marginTop: 32 }}>Semester ended · No more lectures</div>
      </div>
    );
  }

  if (isExamPeriod(wkOff, selDay)) {
    return (
      <div className="content">
        <div className="alert" style={{ cursor: 'default', background: '#dbeafe', borderColor: '#1e3a8a', color: '#1e3a8a' }}>
          📝 Prüfungsphase · Keine regulären Vorlesungen
        </div>
        <div className="no-res" style={{ marginTop: 24 }}>
          Rooms A0.05, B0.01 and B0.09 are exam venues · All other rooms open for study
        </div>
      </div>
    );
  }

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
