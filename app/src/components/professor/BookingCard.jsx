import { useApp } from '../../context/AppContext';

export default function BookingCard({ booking }) {
  const { dispatch } = useApp();

  return (
    <div className="bk-card">
      <div>
        <div className="bk-room">{booking.room}</div>
        <div className="bk-meta">
          {booking.purpose}{booking.time ? ` · ${booking.time}` : ''}
        </div>
      </div>
      <button
        className="btn-cancel-bk"
        onClick={() => dispatch({ type: 'CANCEL_BOOKING', payload: booking.id })}
      >
        Cancel
      </button>
    </div>
  );
}
