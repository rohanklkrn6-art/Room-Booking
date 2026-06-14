import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { m2t, t2m } from '../../utils/time';
import ConfirmModal from '../ConfirmModal';

export default function BookingCard({ booking }) {
  const { dispatch } = useApp();
  const endTime = m2t(t2m(booking.startTime) + booking.durationM);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="bk-card">
      <div>
        <div className="bk-room">{booking.room}</div>
        <div className="bk-meta">
          {booking.purpose} · {booking.startTime}–{endTime} · {booking.size} {booking.size === 1 ? 'person' : 'people'}
        </div>
        {booking.note ? <div className="bk-note">{booking.note}</div> : null}
      </div>
      <button className="btn-cancel-bk" onClick={() => setConfirmOpen(true)}>
        Cancel
      </button>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Cancel this booking?"
        body={`${booking.room} · ${booking.purpose} · ${booking.startTime}–${endTime}`}
        confirmLabel="Cancel booking"
        danger
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          dispatch({ type: 'CANCEL_BOOKING', payload: booking.id });
        }}
      />
    </div>
  );
}
