import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ROOMS } from '../../data/rooms';
import { ALL_LECTS } from '../../data/lectures';
import { getRoomStatus, getTodayIndex, isRoomOccupiedAtTime } from '../../utils/time';

export default function CreateGroupSheet() {
  const { state, dispatch } = useApp();
  const freeRooms = ROOMS.filter(r => {
    const st = getRoomStatus(r.id, state).st;
    return st === 'free' || st === 'few';
  });
  const roomList = freeRooms.length > 0 ? freeRooms : ROOMS;

  const [subject, setSubject] = useState('');
  const [roomId,  setRoomId]  = useState(roomList[0].id);
  const [time,    setTime]    = useState('13:00');
  const [maxSize, setMaxSize] = useState('5');
  const [error,   setError]   = useState('');

  function create() {
    if (!subject.trim()) {
      setError('Please enter a subject or topic.');
      return;
    }

    // Block group creation if the chosen room has a lecture at the chosen time
    const dayLects = ALL_LECTS[getTodayIndex()] || [];
    if (isRoomOccupiedAtTime(roomId, time, dayLects, state.lstatus, state.lrooms)) {
      setError(`${roomId} has a lecture at ${time}. Pick a different room or time.`);
      return;
    }

    setError('');
    dispatch({
      type: 'ADD_GROUP',
      payload: {
        id: `g-${Date.now()}`,
        sub: subject.trim(),
        room: roomId,
        time,
        max: parseInt(maxSize, 10),
        mem: 1,
        joined: true,
        mine: true,
      },
    });
    dispatch({ type: 'CLOSE_SHEET' });
    dispatch({ type: 'SHOW_TOAST', payload: 'Study group created' });
  }

  return (
    <>
      <div className="sh-sec">
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 3 }}>Create study group</div>
      </div>

      <div className="sh-sec">
        <div className="sh-lbl">Subject / Topic</div>
        <input
          className="sh-inp"
          placeholder="e.g. International Finance prep"
          value={subject}
          onChange={e => { setSubject(e.target.value); setError(''); }}
        />
      </div>

      <div className="sh-sec">
        <div className="sh-lbl">Room</div>
        <select className="sh-sel" value={roomId} onChange={e => { setRoomId(e.target.value); setError(''); }}>
          {roomList.map(r => (
            <option key={r.id} value={r.id}>{r.id} · {r.type} ({r.cap} seats)</option>
          ))}
        </select>
      </div>

      <div className="sh-sec">
        <div className="sh-lbl">Start time</div>
        <input
          className="sh-inp"
          type="time"
          value={time}
          onChange={e => { setTime(e.target.value); setError(''); }}
        />
      </div>

      <div className="sh-sec">
        <div className="sh-lbl">Max group size</div>
        <select className="sh-sel" value={maxSize} onChange={e => setMaxSize(e.target.value)}>
          <option>2</option>
          <option>3</option>
          <option>5</option>
          <option>8</option>
          <option>10</option>
        </select>
      </div>

      {error && (
        <div className="sh-sec">
          <div className="sh-error">{error}</div>
        </div>
      )}

      <div className="sh-btn-row">
        <button className="btn-sec" onClick={() => dispatch({ type: 'CLOSE_SHEET' })}>Cancel</button>
        <button className="btn-send" onClick={create}>Create</button>
      </div>
    </>
  );
}
