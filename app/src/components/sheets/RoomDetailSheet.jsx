import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ROOMS } from '../../data/rooms';
import { getRoomStatus, getTodayIndex } from '../../utils/time';

const BADGE = {
  free: { cls: 'b-free', label: 'Free' },
  few:  { cls: 'b-few',  label: 'Few Seats' },
  soon: { cls: 'b-soon', label: 'Soon Occupied' },
  occ:  { cls: 'b-occ',  label: 'Occupied' },
};

function pctColor(pct, prefix) {
  if (pct < 50) return `${prefix}-g`;
  if (pct < 80) return `${prefix}-y`;
  return `${prefix}-r`;
}

export default function RoomDetailSheet({ data }) {
  const { state, dispatch } = useApp();
  const room = ROOMS.find(r => r.id === data.roomId);

  // Incrementing "last updated" counter for IoT data (resets when sheet opens)
  const [minAgo, setMinAgo] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMinAgo(p => p + 1), 60_000);
    return () => clearInterval(t);
  }, []);
  const updatedLabel = minAgo === 0 ? 'Just now' : `${minAgo}m ago`;

  if (!room) return null;

  const nowState = { ...state, wkOff: 0, selDay: getTodayIndex() };
  const rs       = getRoomStatus(room.id, nowState);
  const badge    = BADGE[rs.st] || BADGE.occ;
  const occPct   = Math.min(100, Math.round((rs.occ / room.cap) * 100));
  const isProf   = state.view === 'professor';
  const canBook  = isProf && rs.st !== 'occ';

  return (
    <>
      <div className="sh-rm-hdr">
        <div>
          <div className="sh-rm-name">{room.id}</div>
          <div className="sh-rm-meta">{room.type} · Building {room.b} · {room.cap} seats</div>
        </div>
        <span className={`rm-badge ${badge.cls}`}>{badge.label}</span>
      </div>

      <div className="sh-sec">
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 5 }}>
          <span className="live-dot" />Live Occupancy
        </div>
        <div className="occ-wrap" style={{ height: 8 }}>
          <div
            className={`occ-bar ${pctColor(occPct, 'occ')}`}
            style={{ width: `${occPct}%`, height: 8 }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#999', marginTop: 3 }}>
          <span>{rs.occ === 0 ? `Empty · ${room.cap} seats` : `${rs.occ} / ${room.cap} seats occupied`}</span>
          <span>{occPct}%</span>
        </div>
      </div>

      <div className="sh-sec">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
          <div className="sh-lbl" style={{ margin: 0 }}>Occupancy last 2 hours</div>
          <span style={{ fontSize: 9, color: '#bbb' }}>Updated {updatedLabel}</span>
        </div>
        <div className="iot-graph">
          {(rs.iot || []).map((val, i) => {
            const bp = Math.round((val / room.cap) * 100);
            const h  = Math.max(3, Math.round((bp / 100) * 40));
            return (
              <div
                key={i}
                className={`iot-bar ${pctColor(bp, 'ib')}`}
                style={{ height: h, animationDelay: `${i * 50}ms` }}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#bbb' }}>
          <span>2h ago</span><span>now</span>
        </div>
      </div>

      <div className="sh-sec">
        <div className="sh-lbl">Facilities</div>
        <div className="feat-tags">
          {room.feat.map(f => (
            <span key={f} className="feat-tag" style={{ fontSize: 11, padding: '3px 7px' }}>{f}</span>
          ))}
        </div>
      </div>

      <div className="sh-btn-row">
        <button className="btn-sec" onClick={() => dispatch({ type: 'CLOSE_SHEET' })}>Close</button>
        {canBook && (
          <button
            className="btn-send"
            onClick={() => dispatch({
              type: 'OPEN_SHEET',
              payload: { sheetType: 'bookRoom', sheetData: { roomId: room.id } },
            })}
          >
            Book this room
          </button>
        )}
      </div>
    </>
  );
}
