const STATUS_META = {
  happening: { cls: 's-happening', label: 'Happening' },
  cancelled:  { cls: 's-cancelled', label: 'Cancelled' },
  online:     { cls: 's-online',    label: 'Online today' },
  upcoming:   { cls: 's-upcoming',  label: 'Upcoming' },
  past:       { cls: 's-past',      label: 'Ended' },
};

export default function LectureCard({ lecture, effectiveStatus, effectiveRoom, onTap }) {
  const meta      = STATUS_META[effectiveStatus] || STATUS_META.upcoming;
  const roomLabel = effectiveStatus === 'online' ? 'Online' : (effectiveRoom ?? lecture.room);

  return (
    <div className="lect-card" onClick={onTap}>
      <div className="lc-top">
        <div className="lc-name">{lecture.sub}</div>
        <span className={`st-badge ${meta.cls}`}>{meta.label}</span>
      </div>
      <div className="lc-meta">{roomLabel} · {lecture.t}–{lecture.e}</div>
      <div className="lc-stud">{lecture.n} students enrolled</div>
    </div>
  );
}
