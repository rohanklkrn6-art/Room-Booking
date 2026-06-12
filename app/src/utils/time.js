import { RS } from '../data/rooms';
import { LECTS } from '../data/lectures';

export const UNI_OPEN_M  = 8 * 60;   // 08:00
export const UNI_CLOSE_M = 20 * 60;  // 20:00

export function t2m(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function m2t(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Returns 0=Mon … 4=Fri, or -1 on weekends
export function getTodayIndex() {
  const d = new Date().getDay(); // 0=Sun, 1=Mon … 6=Sat
  if (d === 0 || d === 6) return -1;
  return d - 1;
}

// Initial selDay: today's weekday index, or Monday on weekends
export function getInitialSelDay() {
  const idx = getTodayIndex();
  return idx === -1 ? 0 : idx;
}

export function getNowMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function isUniversityOpen(nowM) {
  return nowM >= UNI_OPEN_M && nowM < UNI_CLOSE_M;
}

// Computes the display status of a lecture.
// - Professor override (lstatus) takes priority for cancelled/online.
// - Seed-level cancelled/online (l.st) treated as an initial override.
// - For today: time-based (upcoming / happening / past).
// - For other days: use seed status.
export function computeLectureStatus(lecture, isToday, lstatus, nowM) {
  const override = lstatus[lecture.id];
  if (override === 'cancelled' || override === 'online') return override;
  if (lecture.st === 'cancelled' || lecture.st === 'online') return lecture.st;

  if (!isToday) return override ?? lecture.st;

  const startM = t2m(lecture.t);
  const endM   = t2m(lecture.e);
  if (nowM < startM) return 'upcoming';
  if (nowM < endM)   return 'happening';
  return 'past';
}

// Derives room status from today's timetable.
// Does NOT look at roomStatuses (overrides) — callers merge those separately.
function computeRoomStatusForDay(roomId, lectures, lstatus, nowM) {
  const roomLects = (lectures || [])
    .filter(l => {
      if (l.room !== roomId) return false;
      const eff = lstatus[l.id] ?? l.st;
      return eff !== 'cancelled' && eff !== 'online';
    })
    .sort((a, b) => t2m(a.t) - t2m(b.t));

  // Is a lecture happening right now?
  const current = roomLects.find(l => nowM >= t2m(l.t) && nowM < t2m(l.e));
  if (current) {
    return { st: 'occ', occ: current.n, fu: current.e, nl: null };
  }

  // Upcoming lectures in this room today
  const upcoming = roomLects.filter(l => t2m(l.t) > nowM);
  if (upcoming.length > 0) {
    const next = upcoming[0];
    const gap  = t2m(next.t) - nowM;
    if (gap <= 30) return { st: 'soon', occ: 0, fu: null, nl: next.t };
    return { st: 'free', occ: 0, fu: null, nl: next.t };
  }

  return { st: 'free', occ: 0, fu: null, nl: null };
}

// Main function used by components.
// Merges: manual professor override > timetable-computed (today) > static RS seed.
export function getRoomStatus(roomId, state) {
  const rsBase = RS[roomId] || { st: 'free', occ: 0, fu: null, nl: null, iot: [] };

  // Professor explicitly set this room's status (booking or lecture cancel)
  if (state.roomStatuses[roomId]) {
    return { ...rsBase, ...state.roomStatuses[roomId] };
  }

  const todayIdx = getTodayIndex();
  const isToday  = state.wkOff === 0 && state.selDay === todayIdx && todayIdx !== -1;

  if (isToday) {
    const lectures    = LECTS[state.selDay] || [];
    const roomInToday = lectures.some(l => l.room === roomId);

    if (roomInToday) {
      const computed = computeRoomStatusForDay(roomId, lectures, state.lstatus, state.nowM);
      // For occupied state use lecture enrollment; for free/soon use IoT sensor occ
      const occ = computed.st === 'occ' ? computed.occ : rsBase.occ;
      return { ...rsBase, ...computed, occ };
    }
  }

  // Non-timetabled rooms or other days → static RS seed
  return rsBase;
}
