import { useApp } from '../../context/AppContext';
import { LECTS } from '../../data/lectures';
import { computeLectureStatus, getTodayIndex } from '../../utils/time';

const STATUS_LABELS = {
  happening: 'Happening',
  cancelled: 'Cancelled',
  online:    'Online today',
  upcoming:  'Upcoming',
  past:      'Ended',
};

export default function LectureDetailSheet({ data }) {
  const { state, dispatch } = useApp();
  const { lectureId, selDay } = data;

  const lecture = (LECTS[selDay] || []).find(l => l.id === lectureId);
  if (!lecture) return null;

  const isToday = state.wkOff === 0 && selDay === getTodayIndex() && getTodayIndex() !== -1;
  const st = computeLectureStatus(lecture, isToday, state.lstatus, state.nowM);

  return (
    <>
      <div className="sh-sec">
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{lecture.sub}</div>
        <div style={{ fontSize: 12, color: '#999' }}>🕐 {lecture.t}–{lecture.e} · 📍 {lecture.room}</div>
        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>👤 {lecture.prof}</div>
      </div>

      <div className="sh-sec">
        <span className={`st-badge s-${st}`} style={{ fontSize: 12, padding: '4px 12px' }}>
          {STATUS_LABELS[st] ?? st}
        </span>
      </div>

      <div className="sh-btn-row">
        <button className="btn-sec" onClick={() => dispatch({ type: 'CLOSE_SHEET' })}>Close</button>
      </div>
    </>
  );
}
