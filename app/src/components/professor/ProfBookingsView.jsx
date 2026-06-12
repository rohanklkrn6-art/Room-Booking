import { useApp } from '../../context/AppContext';
import BookingCard from './BookingCard';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function ProfBookingsView() {
  const { state } = useApp();
  const { bookings, selDay } = state;

  const dayBookings = bookings.filter(b => b.day === selDay);

  return (
    <div className="content">
      <div className="bk-day-label">{DAY_NAMES[selDay] ?? 'Today'}</div>
      {dayBookings.length === 0 && (
        <div className="no-res">No bookings for this day</div>
      )}
      {dayBookings.map(b => (
        <BookingCard key={b.id} booking={b} />
      ))}
    </div>
  );
}
