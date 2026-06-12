/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer } from 'react';
import { LECTS } from '../data/lectures';
import { getInitialSelDay, getNowMinutes } from '../utils/time';

const initialState = {
  view: 'student',
  stTab: 0,
  prTab: 0,
  wkOff: 0,
  selDay: getInitialSelDay(),
  nowM: getNowMinutes(),
  rmSrch: '',
  rmBldg: 'all',
  rmAvail: 0,
  rmCap: 'all',
  groups: [
    { id: 'g1', sub: 'International Finance exam prep', room: 'A0.13', time: '13:00', max: 5, mem: 3, joined: false },
  ],
  bookings: [],
  lstatus: {},
  grpDot: false,
  roomStatuses: {}, // sparse: only manual professor overrides (bookings, explicit cancels)
  sheetType: null,
  sheetData: null,
  toast: { msg: '', show: false },
};

function reducer(state, action) {
  switch (action.type) {

    case 'SET_VIEW':
      return {
        ...state,
        view: action.payload,
        stTab: action.payload === 'student' ? 0 : state.stTab,
        prTab: action.payload === 'professor' ? 0 : state.prTab,
      };

    case 'SET_ST_TAB':
      return {
        ...state,
        stTab: action.payload,
        grpDot: action.payload === 2 ? false : state.grpDot,
        rmSrch: action.payload === 1 ? state.rmSrch : '',
      };

    case 'SET_PR_TAB':
      return { ...state, prTab: action.payload };

    case 'TICK':
      return { ...state, nowM: getNowMinutes() };

    case 'NAV_WK': {
      const next = state.wkOff + action.payload;
      if (next < -4 || next > 4) return state;
      return {
        ...state,
        wkOff: next,
        selDay: next === 0 ? getInitialSelDay() : state.selDay,
      };
    }

    case 'SEL_DAY':
      return { ...state, selDay: action.payload };

    case 'SET_RM_SRCH':
      return { ...state, rmSrch: action.payload };

    case 'SET_RM_BLDG':
      return { ...state, rmBldg: action.payload };

    case 'SET_RM_AVAIL':
      return { ...state, rmAvail: action.payload };

    case 'SET_RM_CAP':
      return { ...state, rmCap: action.payload };

    case 'SHOW_FREE_ROOM':
      return { ...state, stTab: 1, rmSrch: action.payload, rmAvail: 0, rmBldg: 'all', rmCap: 'all' };

    case 'JOIN_GROUP':
      return {
        ...state,
        grpDot: true,
        groups: state.groups.map(g =>
          g.id === action.payload && !g.joined
            ? { ...g, joined: true, mem: g.mem + 1 }
            : g
        ),
      };

    case 'LEAVE_GROUP':
      return {
        ...state,
        groups: state.groups.map(g =>
          g.id === action.payload
            ? { ...g, joined: false, mem: Math.max(0, g.mem - 1) }
            : g
        ),
      };

    case 'DELETE_GROUP':
      return {
        ...state,
        groups: state.groups.filter(g => g.id !== action.payload),
      };

    case 'ADD_GROUP':
      return {
        ...state,
        stTab: 2,
        grpDot: true,
        groups: [...state.groups, action.payload],
      };

    case 'SET_LECT_STATUS': {
      const { id, status } = action.payload;
      let lectureRoom = null;
      for (const day of Object.values(LECTS)) {
        const l = day.find(x => x.id === id);
        if (l) { lectureRoom = l.room; break; }
      }
      const updatedRoomStatuses = { ...state.roomStatuses };
      if (lectureRoom) {
        if (status === 'cancelled' || status === 'online') {
          // Override: force room free because professor cancelled/moved online
          updatedRoomStatuses[lectureRoom] = { st: 'free', occ: 0, fu: null, nl: null };
        } else {
          // Happening: remove override, let timetable-computed status take over
          delete updatedRoomStatuses[lectureRoom];
        }
      }
      return {
        ...state,
        lstatus: { ...state.lstatus, [id]: status },
        roomStatuses: updatedRoomStatuses,
      };
    }

    case 'ADD_BOOKING': {
      const { booking, roomId } = action.payload;
      return {
        ...state,
        bookings: [...state.bookings, { ...booking, day: state.selDay }],
        roomStatuses: {
          ...state.roomStatuses,
          [roomId]: { st: 'occ', occ: booking.size || 1, fu: null, nl: null },
        },
      };
    }

    case 'CANCEL_BOOKING': {
      const target = state.bookings.find(b => b.id === action.payload);
      if (!target) return state;
      // Remove override — timetable-computed status takes over automatically
      const newRoomStatuses = { ...state.roomStatuses };
      delete newRoomStatuses[target.room];
      return {
        ...state,
        bookings: state.bookings.filter(b => b.id !== action.payload),
        roomStatuses: newRoomStatuses,
      };
    }

    case 'OPEN_SHEET':
      return { ...state, sheetType: action.payload.sheetType, sheetData: action.payload.sheetData };

    case 'CLOSE_SHEET':
      return { ...state, sheetType: null, sheetData: null };

    case 'SHOW_TOAST':
      return { ...state, toast: { msg: action.payload, show: true } };

    case 'HIDE_TOAST':
      return { ...state, toast: { ...state.toast, show: false } };

    default:
      return state;
  }
}

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
