import { useApp } from '../../context/AppContext';
import { LECTS } from '../../data/lectures';
import LectureBlock from './LectureBlock';
import { computeLectureStatus, getTodayIndex } from '../../utils/time';

const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17];
const GRID_LINES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetableGrid() {
  const { state, dispatch } = useApp();
  const { selDay, lstatus, wkOff, nowM } = state;

  const lectures = LECTS[selDay] || [];
  const isToday  = wkOff === 0 && selDay === getTodayIndex() && getTodayIndex() !== -1;

  return (
    <div className="tt-outer">
      <div className="tt-wrap">
        <div className="tt-time-col">
          {HOURS.map(h => (
            <div key={h} className="tt-time-lbl">
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
        </div>
        <div className="tt-grid">
          {GRID_LINES.map(i => (
            <div key={i} className="tt-grid-line" style={{ top: i * 68 }} />
          ))}
          {lectures.map(l => (
            <LectureBlock
              key={l.id}
              lecture={l}
              effectiveStatus={computeLectureStatus(l, isToday, lstatus, nowM)}
              onTap={() => dispatch({ type: 'OPEN_SHEET', payload: { sheetType: 'lectureDetail', sheetData: { lectureId: l.id, selDay } } })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
