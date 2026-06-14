import { useMemo, useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ROOMS } from '../../data/rooms';
import RoomFilters from './RoomFilters';
import RoomCard from './RoomCard';
import { getRoomStatus, getTodayIndex, isUniversityOpen, isExamPeriod, t2m } from '../../utils/time';

const FREE_BEFORE_M = 18 * 60; // 18:00 — rooms must free up before this to appear in free-later

function matchesCap(cap, filter) {
  if (filter === 'all')  return true;
  if (filter === '1-4')  return cap <= 25;
  if (filter === '5-20') return cap > 25 && cap <= 50;
  if (filter === '20+')  return cap > 50;
  return true;
}

// Skeleton placeholder for a single room card
function RoomSkeleton() {
  return (
    <div className="skel-card" style={{ padding: 9, margin: '3px 7px', background: 'white', border: '1px solid #f0f0f0', borderRadius: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div className="skeleton skel-line tall" style={{ width: 60, marginBottom: 6 }} />
          <div className="skeleton skel-line short" style={{ width: 100 }} />
        </div>
        <div className="skeleton" style={{ width: 60, height: 20, borderRadius: 10 }} />
      </div>
      <div className="skeleton" style={{ height: 5, borderRadius: 3, marginBottom: 6 }} />
      <div className="skeleton skel-line short" style={{ width: 140 }} />
    </div>
  );
}

export default function RoomsView({ isProf = false }) {
  const { state, dispatch } = useApp();
  const { rmSrch, rmBldg, rmAvail, rmCap, groups, wkOff, selDay, nowM,
          lstatus, lrooms, roomStatuses, hydrated } = state;

  const todayIdx = getTodayIndex();
  const isToday  = wkOff === 0 && selDay === todayIdx;
  const uniOpen  = isUniversityOpen(nowM);

  // Room status always reflects the demo scenario (today = Wednesday).
  const nowState = { ...state, wkOff: 0, selDay: todayIdx };

  // Last-updated ticker: resets to 0 every 15 minutes (simulates a data refresh).
  const [minSince, setMinSince] = useState(0);
  useEffect(() => {
    const tick = setInterval(() => setMinSince(p => (p + 1) % 15), 60_000);
    return () => clearInterval(tick);
  }, []);
  const updatedLabel = minSince === 0 ? 'Just updated' : `Updated ${minSince}m ago`;

  const filtered = useMemo(() => ROOMS.filter(r => {
    if (rmBldg !== 'all' && r.b !== rmBldg) return false;
    if (rmSrch && !r.id.toLowerCase().includes(rmSrch.toLowerCase())) return false;
    if (!matchesCap(r.cap, rmCap)) return false;
    return true;
  }), [rmBldg, rmSrch, rmCap]);

  // Strict non-overlapping buckets.
  // Free now   = st is free/few/soon (available at this moment).
  // Free later = st is occ AND lecture ends before 18:00 (will be free today).
  // A room can only appear in one list.
  const { free, freeLater } = useMemo(() => {
    const free = [], freeLater = [];
    filtered.forEach(r => {
      const rs = getRoomStatus(r.id, nowState);
      const st = rs.st || 'occ';
      if (st === 'free' || st === 'few' || st === 'soon') {
        free.push(r);
      } else if (st === 'occ' && rs.fu && t2m(rs.fu) <= FREE_BEFORE_M) {
        freeLater.push(r);
      }
      // st === 'occ' with fu after 18:00, or no fu → room not shown in either tab
    });
    freeLater.sort((a, b) =>
      t2m(getRoomStatus(a.id, nowState).fu) - t2m(getRoomStatus(b.id, nowState).fu)
    );
    return { free, freeLater };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, lstatus, lrooms, roomStatuses, nowM]);

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
    : 'No rooms free up before 18:00 today';

  return (
    <>
      <RoomFilters />
      <div className="rooms-meta">
        <span>Live room occupancy</span>
        <span>{updatedLabel}</span>
      </div>
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

        {!hydrated ? (
          // Skeleton cards while Firestore connects
          <>
            <div className="sec-title">Loading rooms…</div>
            {[1, 2, 3, 4].map(i => <RoomSkeleton key={i} />)}
          </>
        ) : visibleRooms.length > 0 ? (
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
