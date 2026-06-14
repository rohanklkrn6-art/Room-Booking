import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LECTS, ALL_LECTS } from '../../data/lectures';
import { getEffectiveRoom, getFreeRoomsForSlot } from '../../utils/time';
import ConfirmModal from '../ConfirmModal';
import { sanitise } from '../../utils/sanitise';

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

  const currentSt = lecture
    ? (state.lstatus[lecture.id] ?? (['cancelled', 'online'].includes(lecture.st) ? lecture.st : 'happening'))
    : 'happening';

  const [picked,         setPicked]         = useState(currentSt);
  const [msg,            setMsg]            = useState('');
  const [showRoomPicker, setShowRoomPicker] = useState(false);
  const [newRoomId,      setNewRoomId]      = useState('');
  const [confirmOpen,    setConfirmOpen]    = useState(false);

  if (!lecture) return null;

  const effectiveRoom = getEffectiveRoom(lecture, state.lrooms);
  const displayRoom   = (newRoomId && newRoomId !== effectiveRoom) ? newRoomId : effectiveRoom;

  const freeRooms = getFreeRoomsForSlot(
    ALL_LECTS[state.selDay] || [],
    lecture.t,
    lecture.e,
    lecture.id,
    state.lstatus,
    state.lrooms,
  );

  const statusChanged = picked !== currentSt;
  const roomChanged   = !!newRoomId && newRoomId !== effectiveRoom;
  const hasChange     = statusChanged || roomChanged;

  function doSend() {
    dispatch({
      type: 'SET_LECT_STATUS',
      payload: {
        id:      lecture.id,
        status:  picked,
        note:    sanitise(msg, 300),
        ...(roomChanged && { newRoom: newRoomId }),
      },
    });
    dispatch({ type: 'CLOSE_SHEET' });
  }

  const confirmBody = [
    statusChanged && `Status → ${picked}`,
    roomChanged   && `Room → ${newRoomId}`,
    sanitise(msg, 300).trim() && `Note: "${sanitise(msg, 60)}"`,
  ].filter(Boolean).join(' · ');

  return (
    <>
      {/* Title pinned at top */}
      <div className="sh-title">
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{lecture.sub}</div>
        <div style={{ fontSize: 12, color: '#999' }}>
          🕐 {lecture.t}–{lecture.e} · 📍 {displayRoom} · 👥 {lecture.n} students
        </div>
      </div>

      {/* Scrollable content */}
      <div className="sh-scroll">
        <div className="sh-sec">
          <div className="info-note">📢 Your update will be sent immediately to all enrolled students.</div>
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
          <div className="sh-lbl">Room</div>
          {!showRoomPicker ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600 }}>📍 {displayRoom}</span>
              <button
                style={{ fontSize: 11, color: '#E8821A', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
                onClick={() => setShowRoomPicker(true)}
              >
                Change room →
              </button>
            </div>
          ) : (
            <>
              {freeRooms.length > 0 ? (
                <select
                  className="sh-sel"
                  value={newRoomId || ''}
                  onChange={e => setNewRoomId(e.target.value)}
                >
                  <option value="">Keep current · {effectiveRoom}</option>
                  {freeRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.id} · {r.type} · {r.cap} seats
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>No free rooms during this slot</div>
              )}
              <button
                style={{ fontSize: 11, color: '#999', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0 0', fontFamily: 'Inter, sans-serif' }}
                onClick={() => { setShowRoomPicker(false); setNewRoomId(''); }}
              >
                ✕ Cancel room change
              </button>
            </>
          )}
        </div>

        <div className="sh-sec">
          <div className="sh-lbl">Message to students (optional, max 300 chars)</div>
          <textarea
            className="sh-ta"
            placeholder="e.g. Class starts 15 min late…"
            value={msg}
            maxLength={300}
            onChange={e => setMsg(e.target.value)}
          />
        </div>
      </div>

      {/* Buttons pinned at bottom */}
      <div className="sh-btn-row">
        <button className="btn-sec" onClick={() => dispatch({ type: 'CLOSE_SHEET' })}>Cancel</button>
        <button
          className="btn-send"
          disabled={!hasChange}
          style={!hasChange ? { opacity: 0.5, cursor: 'default' } : {}}
          onClick={() => { if (hasChange) setConfirmOpen(true); }}
        >
          Send update
        </button>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Send update to students?"
        body={confirmBody}
        confirmLabel="Send"
        danger={false}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => { setConfirmOpen(false); doSend(); }}
      />
    </>
  );
}
