const BADGE = {
  free: { cls: 'b-free', label: 'Free' },
  few:  { cls: 'b-few',  label: 'Few Seats' },
  soon: { cls: 'b-soon', label: 'Soon Occupied' },
  occ:  { cls: 'b-occ',  label: 'Occupied' },
};

function occBarColor(occ, cap) {
  const pct = occ / cap;
  if (pct < 0.5) return 'occ-g';
  if (pct < 0.8) return 'occ-y';
  return 'occ-r';
}

function statusLine(status) {
  const { st, fu, nl } = status;
  if (st === 'free' || st === 'few') return nl ? `Free until ${nl}` : 'Free all day';
  if (st === 'soon') return nl ? `Free until ${nl}` : 'Occupied soon';
  if (st === 'occ')  return fu ? `Free from ${fu}` : null;
  return null;
}

export default function RoomCard({ room, status, groups, isProf, onTap, onJoinGroup }) {
  const badge   = BADGE[status.st] || BADGE.occ;
  const occPct  = Math.min(100, Math.round((status.occ / room.cap) * 100));
  const barColor = occBarColor(status.occ, room.cap);
  const subline  = statusLine(status);

  return (
    <div className="room-card" onClick={onTap}>
      <div className="rc-top">
        <div>
          <div className="rc-name">{room.id}</div>
          <div className="rc-meta">{room.type} · {room.cap} seats</div>
        </div>
        <span className={`rm-badge ${badge.cls}`}>{badge.label}</span>
      </div>

      <div className="occ-wrap">
        <div className={`occ-bar ${barColor}`} style={{ width: `${occPct}%` }} />
      </div>

      <div className="rc-stats">
        <span>{status.occ === 0 ? `Empty · ${room.cap} seats` : `${status.occ} / ${room.cap} people`}</span>
        {subline && <span>{subline}</span>}
      </div>

      <div className="feat-tags">
        {room.feat.map(f => <span key={f} className="feat-tag">{f}</span>)}
      </div>

      {!isProf && groups.map(g => (
        <div key={g.id} className="grp-row">
          <span className="grp-info">{g.sub} · {g.mem}/{g.max}</span>
          {!g.joined && (
            <button
              className="btn-join"
              onClick={e => { e.stopPropagation(); onJoinGroup(g.id); }}
            >
              Join
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
