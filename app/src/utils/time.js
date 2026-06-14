import { RS, ROOMS } from '../data/rooms';
import { ALL_LECTS } from '../data/lectures';

export const UNI_OPEN_M  = 8 * 60;   // 08:00
export const UNI_CLOSE_M = 20 * 60;  // 20:00

// Fixed demo scenario: Wednesday at 12:00.
// Business English cancelled → A0.13 free alert is always visible.
export const DEMO_TODAY_IDX = 2; // Wednesday
export const DEMO_NOW_M     = 720; // 12:00

export function t2m(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function m2t(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Always returns DEMO_TODAY_IDX so the pitch scenario is always visible.
export function getTodayIndex() {
  return DEMO_TODAY_IDX;
}

// Always returns DEMO_NOW_M (12:00) for the demo.
export function getNowMinutes() {
  return DEMO_NOW_M;
}

export function getInitialSelDay() {
  return getTodayIndex();
}

// Returns the Monday of the week at wkOff relative to real today.
// Mirrors the same logic used in CalendarStrip so dates are always consistent.
function getWeekMonday(wkOff) {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // Mon=0 … Fri=4
  const mon = new Date(today);
  mon.setDate(today.getDate() - dow + wkOff * 7);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

// Returns the absolute Date for a given week offset + day-of-week index.
export function getDateForDay(wkOff, selDay) {
  const mon = getWeekMonday(wkOff);
  mon.setDate(mon.getDate() + selDay);
  return mon;
}

const EXAM_START = new Date(2026, 6, 16); // 16 July 2026
const SEM_END    = new Date(2026, 6, 31); // 31 July 2026

// True when the selected day falls within the exam period (16–31 July 2026).
export function isExamPeriod(wkOff, selDay) {
  const d = getDateForDay(wkOff, selDay);
  return d >= EXAM_START && d <= SEM_END;
}

// True after semester end (after 31 July 2026).
export function isSemesterOver(wkOff, selDay) {
  return getDateForDay(wkOff, selDay) > SEM_END;
}

// Rooms used as exam venues during the exam period.
const EXAM_HALLS   = new Set(['A0.05', 'B0.01', 'B0.09']);
const STUDY_SPACES = new Set(['C1.01', 'C1.05']);

// During exam period: large halls are exam venues (occupied), study spaces are packed,
// all other rooms are free for student use.
function getExamRoomStatus(roomId, rs) {
  const room = ROOMS.find(r => r.id === roomId);
  const cap  = room ? room.cap : 30;
  if (EXAM_HALLS.has(roomId)) {
    // Exam running now (demo time 12:00 falls in the 10:30–12:30 slot)
    return { st: 'occ', occ: Math.round(cap * 0.9), fu: '12:30', nl: '13:00', iot: rs.iot };
  }
  if (STUDY_SPACES.has(roomId)) {
    return { st: 'few', occ: Math.round(cap * 0.85), fu: null, nl: null, iot: rs.iot };
  }
  return { st: 'free', occ: Math.min(rs.ambientOcc || 0, 3), fu: null, nl: null, iot: rs.iot };
}

export function isUniversityOpen(nowM) {
  return nowM >= UNI_OPEN_M && nowM < UNI_CLOSE_M;
}

// Computes the display status of a lecture for the student timetable.
// Professor overrides (lstatus) take priority over seed defaults.
// Time-based status (upcoming/happening/past) only applies on today.
export function computeLectureStatus(lecture, isToday, lstatus, nowM) {
  const override = lstatus[lecture.id];
  if (override === 'cancelled' || override === 'online') return override;
  if (override === 'happening') return 'happening';
  if (lecture.st === 'cancelled' || lecture.st === 'online') return lecture.st;

  if (!isToday) return lecture.st ?? 'upcoming';

  const startM = t2m(lecture.t);
  const endM   = t2m(lecture.e);
  if (nowM < startM) return 'upcoming';
  if (nowM < endM)   return 'happening';
  return 'past';
}

// Pure derivation of room status from the full lecture schedule and current overrides.
// Called for every room on today's date — no "roomInToday" guard needed.
function computeRoomStatusForDay(roomId, allLectures, lstatus, nowM, rs) {
  const room = ROOMS.find(r => r.id === roomId);
  const cap  = room ? room.cap : 30;

  // Only include lectures that are active (not cancelled, not moved online)
  const roomLects = (allLectures || [])
    .filter(l => {
      if (l.room !== roomId) return false;
      const eff = lstatus[l.id] ?? l.st;
      return eff !== 'cancelled' && eff !== 'online';
    })
    .sort((a, b) => t2m(a.t) - t2m(b.t));

  // Is a lecture currently running?
  const current = roomLects.find(l => nowM >= t2m(l.t) && nowM < t2m(l.e));
  if (current) {
    return { st: 'occ', occ: current.n, fu: current.e, nl: null, iot: rs.iot };
  }

  // Any upcoming lectures today?
  const upcoming = roomLects.filter(l => t2m(l.t) > nowM);
  const next     = upcoming[0];
  const gap      = next ? t2m(next.t) - nowM : Infinity;
  const ao       = rs.ambientOcc || 0;

  // Lecture starts within 30 min — warn students
  if (gap <= 30) {
    return { st: 'soon', occ: ao, fu: null, nl: next.t, iot: rs.iot };
  }

  // Free — but how full is it right now according to IoT?
  const st = ao / cap >= 0.5 ? 'few' : 'free';
  return { st, occ: ao, fu: null, nl: next ? next.t : null, iot: rs.iot };
}

// Main selector used by every component that needs room status.
//
// Priority chain:
//   1. Professor ad-hoc booking (roomStatuses) — explicit manual override
//   2. Derived from lecture schedule (ALL_LECTS) + lstatus — for today only
//   3. Exam period (16–31 July): exam halls occupied, others free
//   4. Ambient IoT reading — all other non-today views
//
// No status is ever stored in RS. RS is IoT data only.
export function getRoomStatus(roomId, state) {
  const rs = RS[roomId] || { ambientOcc: 0, iot: [] };

  if (state.roomStatuses[roomId]) {
    return { ...state.roomStatuses[roomId], iot: rs.iot };
  }

  const todayIdx = getTodayIndex();
  const isToday  = state.wkOff === 0 && state.selDay === todayIdx;

  if (isToday) {
    return computeRoomStatusForDay(
      roomId,
      ALL_LECTS[state.selDay] || [],
      state.lstatus,
      state.nowM,
      rs,
    );
  }

  if (isExamPeriod(state.wkOff, state.selDay)) {
    return getExamRoomStatus(roomId, rs);
  }

  const ao   = rs.ambientOcc || 0;
  const room = ROOMS.find(r => r.id === roomId);
  const cap  = room ? room.cap : 30;
  return { st: ao / cap >= 0.5 ? 'few' : 'free', occ: ao, fu: null, nl: null, iot: rs.iot };
}

// Returns true if the given room has an active (non-cancelled, non-online) lecture
// that overlaps with timeStr (HH:MM) on the given set of day lectures.
// Used by CreateGroupSheet to block conflicting group creation.
export function isRoomOccupiedAtTime(roomId, timeStr, dayLects, lstatus) {
  const timeM = t2m(timeStr);
  return (dayLects || []).some(l => {
    if (l.room !== roomId) return false;
    const eff = lstatus[l.id] ?? l.st;
    if (eff === 'cancelled' || eff === 'online') return false;
    return timeM >= t2m(l.t) && timeM < t2m(l.e);
  });
}
