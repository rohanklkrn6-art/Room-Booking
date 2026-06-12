import { useApp } from '../../context/AppContext';
import { ROOMS } from '../../data/rooms';
import RoomFilters from './RoomFilters';
import RoomCard from './RoomCard';
import { getRoomStatus, getTodayIndex, isUniversityOpen } from '../../utils/time';

function matchesCap(cap, filter) {
  if (filter === 'all') return true;
  if (filter === 's')   return cap <= 30;
  if (filter === 'm')   return cap > 30 && cap <= 60;
  if (filter === 'l')   return cap > 60;
  return true;
}

export default function RoomsView({ isProf = false }) {
  const { state, dispatch } = useApp();
  const { rmSrch, rmBldg, rmAvail, rmCap, groups, nowM, wkOff, selDay } = state;

  const todayIdx  = getTodayIndex();
  const isToday   = wkOff === 0 && selDay === todayIdx && todayIdx !== -1;
  const uniOpen   = isUniversityOpen(nowM);

  const filtered = ROOMS.filter(r => {
    if (rmBldg !== 'all' && r.b !== rmBldg) return false;
    if (rmSrch && !r.id.toLowerCase().includes(rmSrch.toLowerCase())) return false;
    if (!matchesCap(r.cap, rmCap)) return false;
    return true;
  });

  const free = [], freeLater = [];
  filtered.forEach(r => {
    const rs = getRoomStatus(r.id, state);
    const st = rs.st || 'occ';
    if (st === 'free' || st === 'few') {
      free.push(r);
    } else if (st === 'soon' || (st === 'occ' && rs.fu)) {
      freeLater.push(r);
    }
  });

  const visibleCount = free.length + (rmAvail === 1 ? freeLater.length : 0);

  function card(room) {
    const status     = getRoomStatus(room.id, state);
    const roomGroups = groups.filter(g => g.room === room.id);
    return (
      <RoomCard
        key={room.id}
        room={room}
        status={status}
        groups={roomGroups}
        isProf={isProf}
        onTap={() => dispatch({ type: 'OPEN_SHEET', payload: { sheetType: 'roomDetail', sheetData: { roomId: room.id } } })}
        onJoinGroup={id => dispatch({ type: 'JOIN_GROUP', payload: id })}
      />
    );
  }

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
        {free.length > 0 && (
          <>
            <div className="sec-title">Free now</div>
            {free.map(card)}
          </>
        )}
        {rmAvail === 1 && freeLater.length > 0 && (
          <>
            <div className="sec-title">Free later today</div>
            {freeLater.map(card)}
          </>
        )}
        {visibleCount === 0 && (
          <div className="no-res">No rooms found</div>
        )}
      </div>
    </>
  );
}
