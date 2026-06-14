import { RS, ROOMS } from '../data/rooms';
import { ALL_LECTS } from '../data/lectures';

export const UNI_OPEN_M  = 8 * 60;   // 08:00
export const UNI_CLOSE_M = 20 * 60;  // 20:00

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

// ── Demo mode ─────────────────────────────────────────────────────────────────
// Pin the prototype to Wednesday at 12:00 so the pitch scenario is always
// visible regardless of the device's actual date/time.
// On presentation day (17 June 2026) the real day is also Wednesday (index 2),
// so this is correct on the day too.
const DEMO_DAY   = 2;        // Wednesday
const DEMO_NOW_M = 12 * 60;  // 12:00

// Returns Mon=0 … Fri=4 (pinned to Wednesday for demo).
export function getTodayIndex() { return DEMO_DAY; }

// Returns current time as minutes since midnight (pinned to 12:00 for demo).
export function getNowMinutes() { return DEMO_NOW_M; }

export function getInitialSelDay() { return DEMO_DAY; }

// Returns the Monday of the week at wkOff relative to real today.
// Shared by CalendarStrip and date-utility functions to guarantee consistent date math.
export function getWeekMonday(wkOff) {
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

// Returns the room a lecture is currently assigned to, accounting for professor overrides.
export function getEffectiveRoom(lecture, lrooms) {
  return lrooms[lecture.id] ?? lecture.room;
}

// Returns all ROOMS that have no conflicting lecture during [t, e] on a given day.
// excludeLectureId: the lecture being moved (ignored so it doesn't block its own old room).
export function getFreeRoomsForSlot(allLectures, t, e, excludeLectureId, lstatus, lrooms) {
  const startM = t2m(t);
  const endM   = t2m(e);
  const occupied = new Set();

  (allLectures || []).forEach(l => {
    if (l.id === excludeLectureId) return;
    const eff = lstatus[l.id] ?? l.st;
    if (eff === 'cancelled' || eff === 'online') return;
    const effRoom = lrooms[l.id] ?? l.room;
    const ls = t2m(l.t);
    const le = t2m(l.e);
    if (startM < le && endM > ls) occupied.add(effRoom);
  });

  return ROOMS.filter(r => !occupied.has(r.id));
}

// Pure derivation of room status from the full lecture schedule and current overrides.
// Called for every room on today's date — no "roomInToday" guard needed.
function computeRoomStatusForDay(roomId, allLectures, lstatus, lrooms, nowM, rs) {
  const room = ROOMS.find(r => r.id === roomId);
  const cap  = room ? room.cap : 30;

  // Only include lectures that are active (not cancelled, not moved online)
  // and whose effective room (accounting for prof room-change overrides) is this room.
  const roomLects = (allLectures || [])
    .filter(l => {
      const effRoom = lrooms[l.id] ?? l.room;
      if (effRoom !== roomId) return false;
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
      state.lrooms || {},
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
export function isRoomOccupiedAtTime(roomId, timeStr, dayLects, lstatus, lrooms = {}) {
  const timeM = t2m(timeStr);
  return (dayLects || []).some(l => {
    const effRoom = lrooms[l.id] ?? l.room;
    if (effRoom !== roomId) return false;
    const eff = lstatus[l.id] ?? l.st;
    if (eff === 'cancelled' || eff === 'online') return false;
    return timeM >= t2m(l.t) && timeM < t2m(l.e);
  });
}
