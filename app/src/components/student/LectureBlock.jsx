import { t2m } from '../../utils/time';

const STATUS_LABELS = {
  happening: 'Happening',
  cancelled: 'Cancelled',
  online:    'Online today',
  upcoming:  'Upcoming',
  past:      'Ended',
};

function m2top(m) {
  return ((m - 540) / 60) * 68;
}

function dur2h(s, e) {
  return ((e - s) / 60) * 68;
}

export default function LectureBlock({ lecture, effectiveStatus, effectiveRoom, onTap }) {
  const startM = t2m(lecture.t);
  const endM   = t2m(lecture.e);
  const top    = m2top(startM);
  const height = dur2h(startM, endM);
  const roomLabel = effectiveStatus === 'online' ? 'Online' : (effectiveRoom ?? lecture.room);

  return (
    <div
      className={`lb s-${effectiveStatus}`}
      style={{ top, height }}
      onClick={onTap}
    >
      <div className="lb-title">{lecture.sub}</div>
      <div className="lb-room">{roomLabel}</div>
      <span className="lb-badge">{STATUS_LABELS[effectiveStatus] ?? effectiveStatus}</span>
    </div>
  );
}
