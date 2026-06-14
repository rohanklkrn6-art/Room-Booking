import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LECTS } from '../../data/lectures';
import TimetableGrid from './TimetableGrid';
import {
  isExamPeriod, isSemesterOver, computeLectureStatus,
  getEffectiveRoom, getTodayIndex,
} from '../../utils/time';

// Skeleton for timetable blocks during initial hydration
function TimetableSkeleton() {
  return (
    <div className="tt-outer">
      <div className="tt-wrap">
        <div className="tt-time-col">
          {[9, 10, 11, 12, 13, 14, 15, 16, 17].map(h => (
            <div key={h} className="tt-time-lbl" style={{ color: '#e0e0e0' }}>
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
        </div>
        <div className="tt-grid" style={{ minHeight: 544 }}>
          {/* Fake skeleton lecture blocks */}
          <div className="skeleton skel-block" style={{ top: 32,  height: 100, opacity: 0.7 }} />
          <div className="skeleton skel-block" style={{ top: 168, height: 100, opacity: 0.5 }} />
          <div className="skeleton skel-block" style={{ top: 304, height: 100, opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
}

export default function TimetableView() {
  const { state, dispatch } = useApp();
  const { selDay, wkOff, hydrated, lstatus, lnotes, lrooms, nowM } = state;
  // Key = lectureId::status::note — changes when professor sends a new update,
  // even for the same lecture, so the banner reappears after new professor action.
  const [dismissed, setDismissed] = useState(new Set());

  function alertKey(l) {
    return `${l.id}::${lstatus[l.id] ?? l.st}::${lnotes?.[l.id] ?? ''}`;
  }
  function dismissAlert(e, l) {
    e.stopPropagation();
    setDismissed(prev => new Set([...prev, alertKey(l)]));
  }

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
          📝 Exam period · No regular lectures
        </div>
        <div className="no-res" style={{ marginTop: 24 }}>
          Rooms A0.05, B0.01 and B0.09 are exam venues · All other rooms open for study
        </div>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="content">
        <TimetableSkeleton />
      </div>
    );
  }

  const lectures = LECTS[selDay] || [];
  const isToday  = wkOff === 0 && selDay === getTodayIndex();

  const cancelledToday = isToday
    ? lectures.filter(l =>
        computeLectureStatus(l, true, lstatus, nowM) === 'cancelled' &&
        !dismissed.has(alertKey(l))
      )
    : [];

  if (lectures.length === 0) {
    return (
      <div className="content">
        <div className="no-res" style={{ marginTop: 32 }}>No lectures scheduled for this day</div>
      </div>
    );
  }

  return (
    <div className="content">
      {cancelledToday.map(l => (
        <div
          key={l.id}
          className="alert"
          onClick={() => dispatch({ type: 'SET_ST_TAB', payload: 1 })}
        >
          <span>🚫 {l.sub} cancelled · {getEffectiveRoom(l, lrooms)} now free</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <span style={{ fontSize: 10, opacity: 0.7 }}>→ Rooms</span>
            <span
              style={{ fontSize: 16, lineHeight: 1, color: '#a0692a', padding: '0 2px', cursor: 'pointer' }}
              onClick={e => dismissAlert(e, l)}
            >×</span>
          </div>
        </div>
      ))}
      <TimetableGrid />
    </div>
  );
}
