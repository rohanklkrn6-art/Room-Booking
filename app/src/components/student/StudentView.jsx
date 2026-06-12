import { useApp } from '../../context/AppContext';
import Header from '../Header';
import CalendarStrip from '../CalendarStrip';
import TabNav from '../TabNav';
import TimetableView from './TimetableView';
import RoomsView from '../rooms/RoomsView';
import GroupsView from './GroupsView';

export default function StudentView() {
  const { state, dispatch } = useApp();
  const { stTab, grpDot } = state;

  const tabs = [
    { label: 'My Plan' },
    { label: 'Rooms' },
    { label: 'Groups', dot: grpDot },
  ];

  return (
    <div className="screen on">
      <Header title="Smart Timetable" />
      <CalendarStrip />
      <TabNav
        tabs={tabs}
        activeTab={stTab}
        onTabChange={i => dispatch({ type: 'SET_ST_TAB', payload: i })}
      />
      {stTab === 0 && <TimetableView />}
      {stTab === 1 && <RoomsView />}
      {stTab === 2 && <GroupsView />}
    </div>
  );
}
