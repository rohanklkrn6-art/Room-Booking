import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LECTS } from '../../data/lectures';

const OPTS = [
  { key: 'happening', icon: '✅', label: 'Happening' },
  { key: 'cancelled', icon: '✕',  label: 'Cancelled' },
  { key: 'online',    icon: '💻', label: 'Online today' },
];

function findLecture(id) {
  for (const day of Object.values(LECTS)) {
    const l = day.find(x => x.id === id);
    if (l) return l;
  }
  return null;
}

export default function ProfLectureSheet({ data }) {
  const { state, dispatch } = useApp();
  const lecture = findLecture(data.lectureId);

  // hooks must be called unconditionally before any early return
  const currentSt = lecture
    ? (state.lstatus[lecture.id] ?? (['cancelled', 'online'].includes(lecture.st) ? lecture.st : 'happening'))
    : 'happening';
  const [picked, setPicked] = useState(currentSt);
  const [msg, setMsg] = useState('');

  if (!lecture) return null;

  function send() {
    dispatch({ type: 'SET_LECT_STATUS', payload: { id: lecture.id, status: picked } });
    dispatch({ type: 'CLOSE_SHEET' });
    dispatch({ type: 'SHOW_TOAST', payload: 'Status updated · Students notified' });
  }

  return (
    <>
      <div className="sh-sec">
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{lecture.sub}</div>
        <div style={{ fontSize: 12, color: '#999' }}>
          🕐 {lecture.t}–{lecture.e} · 📍 {lecture.room} · 👥 {lecture.n} students
        </div>
      </div>

      <div className="sh-sec">
        <div className="info-note">📢 Your update will be sent immediately to all students.</div>
      </div>

      <div className="sh-sec">
        <div className="sh-lbl">Update status</div>
        <div className="sh-row">
          {OPTS.map(o => (
            <div
              key={o.key}
              className={`st-opt${picked === o.key ? ' sel' : ''}`}
              onClick={() => setPicked(o.key)}
            >
              {o.icon}<br />{o.label}
            </div>
          ))}
        </div>
      </div>

      <div className="sh-sec">
        <div className="sh-lbl">Message (optional)</div>
        <textarea
          className="sh-ta"
          placeholder="Message to students…"
          value={msg}
          onChange={e => setMsg(e.target.value)}
        />
      </div>

      <div className="sh-btn-row">
        <button className="btn-sec" onClick={() => dispatch({ type: 'CLOSE_SHEET' })}>Cancel</button>
        <button className="btn-send" onClick={send}>Send</button>
      </div>
    </>
  );
}
