import { useApp } from '../context/AppContext';
import RoomDetailSheet   from './sheets/RoomDetailSheet';
import LectureDetailSheet from './sheets/LectureDetailSheet';
import BookRoomSheet     from './sheets/BookRoomSheet';
import CreateGroupSheet  from './sheets/CreateGroupSheet';
import ProfLectureSheet  from './sheets/ProfLectureSheet';

const SHEETS = {
  roomDetail:    RoomDetailSheet,
  lectureDetail: LectureDetailSheet,
  bookRoom:      BookRoomSheet,
  createGroup:   CreateGroupSheet,
  profLecture:   ProfLectureSheet,
};

export default function BottomSheet() {
  const { state, dispatch } = useApp();
  const { sheetType, sheetData } = state;
  const isOpen = !!sheetType;
  const SheetContent = SHEETS[sheetType] ?? null;

  function handleOverlay(e) {
    if (e.target === e.currentTarget) dispatch({ type: 'CLOSE_SHEET' });
  }

  return (
    <div className={`overlay${isOpen ? ' open' : ''}`} onClick={handleOverlay}>
      <div className="sheet">
        <div className="sh-handle" />
        {SheetContent && <SheetContent data={sheetData ?? {}} />}
      </div>
    </div>
  );
}
