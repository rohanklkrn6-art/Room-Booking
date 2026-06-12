import { useApp } from '../../context/AppContext';
import Header from '../Header';
import CalendarStrip from '../CalendarStrip';
import TabNav from '../TabNav';
import ProfLecturesView from './ProfLecturesView';
import RoomsView from '../rooms/RoomsView';
import ProfBookingsView from './ProfBookingsView';

export default function ProfessorView() {
  const { state, dispatch } = useApp();
  const { prTab } = state;

  const tabs = [
    { label: 'Lectures' },
    { label: 'Rooms' },
    { label: 'Bookings' },
  ];

  return (
    <div className="screen on">
      <Header title="Smart Timetable" isProf />
      <CalendarStrip />
      <TabNav
        tabs={tabs}
        activeTab={prTab}
        onTabChange={i => dispatch({ type: 'SET_PR_TAB', payload: i })}
      />
      {prTab === 0 && <ProfLecturesView />}
      {prTab === 1 && <RoomsView isProf />}
      {prTab === 2 && <ProfBookingsView />}
    </div>
  );
}
