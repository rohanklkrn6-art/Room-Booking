import { useState } from 'react';
import { useApp } from '../../context/AppContext';

export default function BookRoomSheet({ data }) {
  const { dispatch } = useApp();
  const { roomId } = data;
  const [purpose,   setPurpose]   = useState('Office hours');
  const [startTime, setStartTime] = useState('11:00');
  const [duration,  setDuration]  = useState('60 minutes');
  const [note,      setNote]      = useState('');

  function confirm() {
    const booking = {
      id: `bk-${Date.now()}`,
      room: roomId,
      purpose,
      time: `${startTime} · ${duration}`,
      note,
    };
    dispatch({ type: 'ADD_BOOKING', payload: { booking, roomId } });
    dispatch({ type: 'CLOSE_SHEET' });
    dispatch({ type: 'SHOW_TOAST', payload: `${roomId} booked` });
  }

  return (
    <>
      <div className="sh-sec">
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 3 }}>Book room {roomId}</div>
        <div style={{ fontSize: 12, color: '#999' }}>Ad-hoc booking</div>
      </div>

      <div className="sh-sec">
        <div className="sh-lbl">Purpose</div>
        <select className="sh-sel" value={purpose} onChange={e => setPurpose(e.target.value)}>
          <option>Office hours</option>
          <option>Extra lecture</option>
          <option>Team meeting</option>
          <option>Exam preparation</option>
        </select>
      </div>

      <div className="sh-sec">
        <div className="sh-lbl">Start time</div>
        <input
          className="sh-inp"
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
        />
      </div>

      <div className="sh-sec">
        <div className="sh-lbl">Duration</div>
        <select className="sh-sel" value={duration} onChange={e => setDuration(e.target.value)}>
          <option>30 minutes</option>
          <option>60 minutes</option>
          <option>90 minutes</option>
          <option>120 minutes</option>
        </select>
      </div>

      <div className="sh-sec">
        <div className="sh-lbl">Note (optional)</div>
        <textarea
          className="sh-ta"
          placeholder="Optional note…"
          value={note}
          onChange={e => setNote(e.target.value)}
        />
      </div>

      <div className="sh-btn-row">
        <button className="btn-sec" onClick={() => dispatch({ type: 'CLOSE_SHEET' })}>Cancel</button>
        <button className="btn-send" onClick={confirm}>Book</button>
      </div>
    </>
  );
}
