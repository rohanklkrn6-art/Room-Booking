import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { m2t, t2m } from '../../utils/time';
import ConfirmModal from '../ConfirmModal';
import { sanitise } from '../../utils/sanitise';

export default function BookRoomSheet({ data }) {
  const { dispatch } = useApp();
  const { roomId } = data;

  const [purpose,     setPurpose]     = useState('Office hours');
  const [startTime,   setStartTime]   = useState('13:00');
  const [durationM,   setDurationM]   = useState(60);
  const [size,        setSize]        = useState(5);
  const [note,        setNote]        = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const endTime = m2t(t2m(startTime) + durationM);

  function doBook() {
    const booking = {
      id:        `bk-${Date.now()}`,
      room:      roomId,
      purpose:   sanitise(purpose, 100),
      startTime,
      durationM,
      size,
      note:      sanitise(note, 300),
    };
    dispatch({ type: 'ADD_BOOKING', payload: { booking, roomId } });
    dispatch({ type: 'CLOSE_SHEET' });
  }

  return (
    <>
      <div className="sh-title">
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>Book {roomId}</div>
        <div style={{ fontSize: 12, color: '#999' }}>Ad-hoc booking · {startTime}–{endTime}</div>
      </div>

      <div className="sh-scroll">
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
          <select className="sh-sel" value={durationM} onChange={e => setDurationM(Number(e.target.value))}>
            <option value={30}>30 minutes</option>
            <option value={60}>60 minutes</option>
            <option value={90}>90 minutes</option>
            <option value={120}>120 minutes</option>
          </select>
        </div>

        <div className="sh-sec">
          <div className="sh-lbl">Attendees</div>
          <select className="sh-sel" value={size} onChange={e => setSize(Number(e.target.value))}>
            <option value={2}>2 people</option>
            <option value={3}>3 people</option>
            <option value={5}>5 people</option>
            <option value={8}>8 people</option>
            <option value={10}>10 people</option>
            <option value={15}>15 people</option>
            <option value={20}>20 people</option>
          </select>
        </div>

        <div className="sh-sec">
          <div className="sh-lbl">Note (optional, max 300 chars)</div>
          <textarea
            className="sh-ta"
            placeholder="Optional note…"
            value={note}
            maxLength={300}
            onChange={e => setNote(e.target.value)}
          />
        </div>
      </div>

      <div className="sh-btn-row">
        <button className="btn-sec" onClick={() => dispatch({ type: 'CLOSE_SHEET' })}>Cancel</button>
        <button className="btn-send" onClick={() => setConfirmOpen(true)}>Book</button>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title={`Book ${roomId}?`}
        body={`${purpose} · ${startTime}–${endTime} · ${size} ${size === 1 ? 'person' : 'people'}`}
        confirmLabel="Confirm booking"
        danger={false}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => { setConfirmOpen(false); doBook(); }}
      />
    </>
  );
}
