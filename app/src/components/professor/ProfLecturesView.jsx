import { useApp } from '../../context/AppContext';
import { LECTS } from '../../data/lectures';
import LectureCard from './LectureCard';
import { computeLectureStatus, getTodayIndex } from '../../utils/time';

export default function ProfLecturesView() {
  const { state, dispatch } = useApp();
  const { selDay, lstatus, wkOff, nowM } = state;

  const lectures = LECTS[selDay] || [];
  const isToday  = wkOff === 0 && selDay === getTodayIndex();

  function effectiveSt(l) {
    return computeLectureStatus(l, isToday, lstatus, nowM);
  }

  const active    = lectures.filter(l => effectiveSt(l) === 'happening').length;
  const cancelled = lectures.filter(l => effectiveSt(l) === 'cancelled').length;
  const online    = lectures.filter(l => effectiveSt(l) === 'online').length;

  if (lectures.length === 0) {
    return (
      <div className="content">
        <div className="no-res">No lectures scheduled for this day</div>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="stat-cards">
        <div className="stat-card">
          <div className="stat-num">{lectures.length}</div>
          <div className="stat-lbl">Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{active}</div>
          <div className="stat-lbl">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{cancelled}</div>
          <div className="stat-lbl">Cancelled</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{online}</div>
          <div className="stat-lbl">Online</div>
        </div>
      </div>

      {lectures.map(l => (
        <LectureCard
          key={l.id}
          lecture={l}
          effectiveStatus={effectiveSt(l)}
          onTap={() => dispatch({ type: 'OPEN_SHEET', payload: { sheetType: 'profLecture', sheetData: { lectureId: l.id } } })}
        />
      ))}
    </div>
  );
}
