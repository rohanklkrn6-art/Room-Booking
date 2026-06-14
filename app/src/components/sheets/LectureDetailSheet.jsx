import { useApp } from '../../context/AppContext';
import { LECTS } from '../../data/lectures';
import { computeLectureStatus, getTodayIndex, getEffectiveRoom } from '../../utils/time';

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

  const isToday = state.wkOff === 0 && selDay === getTodayIndex();
  const st          = computeLectureStatus(lecture, isToday, state.lstatus, state.nowM);
  const note        = state.lnotes[lecture.id];
  const effectiveRoom = st === 'online' ? 'Online' : getEffectiveRoom(lecture, state.lrooms);

  return (
    <>
      <div className="sh-sec">
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{lecture.sub}</div>
        <div style={{ fontSize: 12, color: '#999' }}>🕐 {lecture.t}–{lecture.e} · 📍 {effectiveRoom}</div>
        <div style={{ fontSize: 12, color: '#999', marginTop: 2 }}>👤 {lecture.prof}</div>
      </div>

      <div className="sh-sec">
        <span className={`st-badge s-${st}`} style={{ fontSize: 12, padding: '4px 12px' }}>
          {STATUS_LABELS[st] ?? st}
        </span>
      </div>

      {note && (
        <div className="sh-sec">
          <div className="sh-lbl">Note from professor</div>
          <div className="info-note" style={{ marginTop: 4 }}>{note}</div>
        </div>
      )}

      <div className="sh-btn-row">
        <button className="btn-sec" onClick={() => dispatch({ type: 'CLOSE_SHEET' })}>Close</button>
      </div>
    </>
  );
}
