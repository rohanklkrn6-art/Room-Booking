import { useApp } from '../context/AppContext';
import { CHANGE_DAYS } from '../data/lectures';
import { getTodayIndex, getWeekMonday } from '../utils/time';

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function isoWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default function CalendarStrip() {
  const { state, dispatch } = useApp();
  const { wkOff, selDay } = state;

  // Use the demo-pinned today so the orange circle is always on Wednesday.
  const todayIdx = getTodayIndex();

  const monday = getWeekMonday(wkOff);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const sunday = days[6];
  const wkLabel = `Wk ${isoWeek(monday)} · ${monday.getDate()} ${MONTHS[monday.getMonth()]} – ${sunday.getDate()} ${MONTHS[sunday.getMonth()]}`;

  return (
    <div className="cal-strip">
      <div className="cal-nav">
        <button
          className="cal-nav-btn"
          onClick={() => dispatch({ type: 'NAV_WK', payload: -1 })}
        >
          ‹
        </button>
        <span className="cal-wk-lbl">{wkLabel}</span>
        <button
          className="cal-nav-btn"
          onClick={() => dispatch({ type: 'NAV_WK', payload: 1 })}
        >
          ›
        </button>
      </div>
      <div className="cal-days">
        {days.map((d, i) => {
          const isTodayCell = wkOff === 0 && i === todayIdx;
          const isSelCell   = i === selDay;
          const hasDot      = wkOff === 0 && CHANGE_DAYS[i];

          let cls = 'cal-day';
          if (isTodayCell) cls += ' today';
          if (isSelCell)   cls += ' sel';

          return (
            <div
              key={i}
              className={cls}
              onClick={() => dispatch({ type: 'SEL_DAY', payload: i })}
            >
              <span className="cal-dn">{DAY_NAMES[i]}</span>
              <span className="cal-dd">{d.getDate()}</span>
              {hasDot ? <span className="cal-dot" /> : <span className="cal-dot-ph" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
