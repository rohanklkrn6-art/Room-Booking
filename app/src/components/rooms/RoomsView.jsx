import { useApp } from '../../context/AppContext';
import { ROOMS } from '../../data/rooms';
import RoomFilters from './RoomFilters';
import RoomCard from './RoomCard';
import { getRoomStatus, getTodayIndex, isUniversityOpen, isExamPeriod, t2m } from '../../utils/time';

// Maps the group-size filter key to a minimum room capacity.
// Students pick "I have N people" and we show rooms with enough seats.
function matchesCap(cap, filter) {
  if (filter === 'all') return true;
  if (filter === 'xs') return cap <= 25;         // small seminar rooms
  if (filter === 's')  return cap > 25 && cap <= 45;
  if (filter === 'l')  return cap > 45;
  return true;
}

export default function RoomsView({ isProf = false }) {
  const { state, dispatch } = useApp();
  const { rmSrch, rmBldg, rmAvail, rmCap, groups, wkOff, selDay, nowM } = state;

  const todayIdx = getTodayIndex();
  const isToday  = wkOff === 0 && selDay === todayIdx;
  const uniOpen  = isUniversityOpen(nowM);

  // Room status always reflects right now (demo today = Wednesday), regardless of
  // which calendar day the student has selected in the timetable strip.
  const nowState = { ...state, wkOff: 0, selDay: todayIdx };

  const filtered = ROOMS.filter(r => {
    if (rmBldg !== 'all' && r.b !== rmBldg) return false;
    if (rmSrch && !r.id.toLowerCase().includes(rmSrch.toLowerCase())) return false;
    if (!matchesCap(r.cap, rmCap)) return false;
    return true;
  });

  // Separate into two buckets:
  //   free      → shown on "Free now" tab     (st free or few)
  //   freeLater → shown on "Free later" tab   (currently occ but has a known free-from time)
  const free = [], freeLater = [];
  filtered.forEach(r => {
    const rs = getRoomStatus(r.id, nowState);
    const st = rs.st || 'occ';
    if (st === 'free' || st === 'few') {
      free.push(r);
    } else if ((st === 'occ' || st === 'soon') && rs.fu) {
      freeLater.push(r);
    }
  });

  // Sort "free later" by when they become free (soonest first)
  freeLater.sort((a, b) => {
    const am = t2m(getRoomStatus(a.id, nowState).fu);
    const bm = t2m(getRoomStatus(b.id, nowState).fu);
    return am - bm;
  });

  function card(room) {
    const status     = getRoomStatus(room.id, nowState);
    const roomGroups = groups.filter(g => g.room === room.id);
    return (
      <RoomCard
        key={room.id}
        room={room}
        status={status}
        groups={roomGroups}
        isProf={isProf}
        onTap={() => dispatch({
          type: 'OPEN_SHEET',
          payload: { sheetType: 'roomDetail', sheetData: { roomId: room.id } },
        })}
        onJoinGroup={id => dispatch({ type: 'JOIN_GROUP', payload: id })}
      />
    );
  }

  const visibleRooms = rmAvail === 0 ? free : freeLater;
  const sectionTitle = rmAvail === 0
    ? `Free now · ${free.length} room${free.length !== 1 ? 's' : ''}`
    : `Free later today · ${freeLater.length} room${freeLater.length !== 1 ? 's' : ''}`;
  const emptyMsg = rmAvail === 0
    ? 'No free rooms match your filters'
    : 'No rooms become free later today';

  return (
    <>
      <RoomFilters />
      <div className="content">
        {isToday && !uniOpen && (
          <div className="alert" style={{ cursor: 'default' }}>
            {nowM < 8 * 60
              ? 'University not yet open · Room data updates from 08:00'
              : 'University closed · No rooms available until tomorrow 08:00'}
          </div>
        )}
        {isExamPeriod(nowState.wkOff, nowState.selDay) && (
          <div className="alert" style={{ cursor: 'default', background: '#dbeafe', borderColor: '#1e3a8a', color: '#1e3a8a' }}>
            📝 Exam period · A0.05, B0.01 &amp; B0.09 reserved as exam venues · All other rooms available for study
          </div>
        )}

        {visibleRooms.length > 0 ? (
          <>
            <div className="sec-title">{sectionTitle}</div>
            {visibleRooms.map(card)}
          </>
        ) : (
          <div className="no-res">{emptyMsg}</div>
        )}
      </div>
    </>
  );
}
