/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { getInitialSelDay, getNowMinutes, t2m, m2t } from '../utils/time';
import { sanitise } from '../utils/sanitise';
import { db } from '../firebase';
import {
  doc, collection, onSnapshot,
  setDoc, updateDoc, deleteDoc, getDocs,
  runTransaction,
} from 'firebase/firestore';

// ── Firestore refs ────────────────────────────────────────────────────────────
const overridesRef = doc(db, 'state', 'overrides');
const groupsCol    = collection(db, 'groups');
const bookingsCol  = collection(db, 'bookings');

// Seed data: initial study group restored on reset / first run
const SEED_GROUP = {
  id: 'g1',
  sub: 'International Finance exam prep',
  room: 'A0.13',
  time: '13:00',
  max: 5,
  mem: 3,
  joined: false,
};

// ── Local state ───────────────────────────────────────────────────────────────
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
  groups: [SEED_GROUP],
  bookings: [],
  lstatus: {},
  lnotes: {},
  lrooms: {},
  grpDot: false,
  roomStatuses: {},
  sheetType: null,
  sheetData: null,
  toast: { msg: '', show: false, showUndo: false },
  hydrated: false,
};

function reducer(state, action) {
  switch (action.type) {

    case 'HYDRATE': {
      const p = action.payload;
      return {
        ...state,
        ...(p.lstatus      !== undefined && { lstatus:      p.lstatus }),
        ...(p.lnotes       !== undefined && { lnotes:       p.lnotes }),
        ...(p.lrooms       !== undefined && { lrooms:       p.lrooms }),
        ...(p.roomStatuses !== undefined && { roomStatuses: p.roomStatuses }),
        ...(p.groups       !== undefined && { groups:       p.groups }),
        ...(p.bookings     !== undefined && { bookings:     p.bookings }),
      };
    }

    case 'SET_HYDRATED':
      return { ...state, hydrated: true };

    // Instant local reset (Firestore writes happen in resetToDefaults)
    case 'RESET':
      return {
        ...state,
        lstatus: {},
        lnotes: {},
        lrooms: {},
        roomStatuses: {},
        bookings: [],
        groups: [SEED_GROUP],
      };

    case 'SET_VIEW':
      return {
        ...state,
        view: action.payload,
        stTab: action.payload === 'student'   ? 0 : state.stTab,
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
      if (next < -4 || next > 7) return state;
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
      const { id, status, note } = action.payload;
      const nextNotes = note?.trim()
        ? { ...state.lnotes, [id]: note.trim() }
        : state.lnotes;
      return {
        ...state,
        lstatus: { ...state.lstatus, [id]: status },
        lnotes: nextNotes,
      };
    }

    case 'SET_LECT_ROOM': {
      const { id, roomId } = action.payload;
      return { ...state, lrooms: { ...state.lrooms, [id]: roomId } };
    }

    case 'ADD_BOOKING': {
      const { booking, roomId } = action.payload;
      const endM = t2m(booking.startTime) + booking.durationM;
      return {
        ...state,
        bookings: [...state.bookings, { ...booking, day: state.selDay }],
        roomStatuses: {
          ...state.roomStatuses,
          [roomId]: { st: 'occ', occ: booking.size || 5, fu: m2t(endM), nl: null },
        },
      };
    }

    case 'CANCEL_BOOKING': {
      const target = state.bookings.find(b => b.id === action.payload);
      if (!target) return state;
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

    case 'SHOW_TOAST': {
      const p = action.payload;
      const msg      = typeof p === 'string' ? p : (p?.msg ?? '');
      const showUndo = typeof p === 'string' ? false : !!p?.showUndo;
      return { ...state, toast: { msg, show: true, showUndo } };
    }

    case 'HIDE_TOAST':
      return { ...state, toast: { msg: state.toast.msg, show: false, showUndo: false } };

    default:
      return state;
  }
}

// ── Context ───────────────────────────────────────────────────────────────────
export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Always-current state for closures that must not go stale.
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; });

  // Pending Firestore write — professor actions delay 5 s to allow undo.
  const pendingRef = useRef(null); // { timer, write, snap }

  // ── Firestore write helpers ───────────────────────────────────────────────

  // Read-before-write transaction: merges each sub-map individually so that
  // two concurrent professor sessions don't silently overwrite each other.
  // Firestore will automatically retry the transaction on conflict.
  const writeOverrides = useCallback((patch = {}) => {
    const s = stateRef.current;
    const local = {
      lstatus:      s.lstatus,
      lnotes:       s.lnotes,
      lrooms:       s.lrooms,
      roomStatuses: s.roomStatuses,
      ...patch,
    };
    runTransaction(db, async (tx) => {
      const curr = await tx.get(overridesRef);
      const base = curr.exists()
        ? curr.data()
        : { lstatus: {}, lnotes: {}, lrooms: {}, roomStatuses: {} };
      tx.set(overridesRef, {
        lstatus:      { ...base.lstatus,      ...local.lstatus },
        lnotes:       { ...base.lnotes,       ...local.lnotes },
        lrooms:       { ...base.lrooms,       ...local.lrooms },
        roomStatuses: { ...base.roomStatuses, ...local.roomStatuses },
      });
    }).catch(() => {});
  }, []);

  // Schedule a delayed Firestore write that can be cancelled by undo.
  //
  // actionKey — identifies the target being modified (e.g. 'status-lw2').
  // If a new action arrives with the SAME key before the timer fires, the
  // old pending write is CANCELLED (not flushed) and the original pre-action
  // snapshot is kept, so undo restores the state from before any chained
  // changes on that target.  A DIFFERENT key flushes the previous write
  // immediately so it isn't silently lost.
  const schedulePendingWrite = useCallback((write, snap, toastMsg, actionKey = null) => {
    const sameKey = !!(
      pendingRef.current &&
      actionKey &&
      pendingRef.current.key === actionKey
    );
    const effectiveSnap = sameKey ? pendingRef.current.snap : snap;

    if (pendingRef.current) {
      clearTimeout(pendingRef.current.timer);
      if (!sameKey) pendingRef.current.write(); // commit unrelated pending action now
      pendingRef.current = null;
    }

    const timer = setTimeout(() => {
      pendingRef.current = null;
      write();
    }, 5000);
    pendingRef.current = { timer, write, snap: effectiveSnap, key: actionKey };
    dispatch({ type: 'SHOW_TOAST', payload: { msg: toastMsg, showUndo: true } });
  }, [dispatch]);

  // Undo: cancel pending Firestore write and restore pre-action state.
  const handleUndo = useCallback(() => {
    if (!pendingRef.current) return;
    clearTimeout(pendingRef.current.timer);
    const { snap } = pendingRef.current;
    pendingRef.current = null;
    dispatch({ type: 'HYDRATE', payload: snap }); // raw dispatch — no Firestore write
    dispatch({ type: 'SHOW_TOAST', payload: 'Change undone' });
  }, []);

  // ── Wrapped dispatch ──────────────────────────────────────────────────────

  const fbDispatch = useCallback((action) => {
    const s = stateRef.current;

    switch (action.type) {

      case 'SET_LECT_STATUS': {
        const { id, status, note, newRoom } = action.payload;
        if (!id || !status) return;
        const cleanNote = sanitise(note ?? '', 300);
        // Snapshot includes lrooms only when a room change is part of this action,
        // so undo can restore both changes together.
        const snap = {
          lstatus: { ...s.lstatus },
          lnotes:  { ...s.lnotes },
          ...(newRoom != null && { lrooms: { ...s.lrooms } }),
        };
        const newLstatus = { ...s.lstatus, [id]: status };
        const newLnotes  = cleanNote.trim()
          ? { ...s.lnotes, [id]: cleanNote.trim() }
          : s.lnotes;

        // Apply both local changes via raw reducer dispatch (no Firestore write).
        if (newRoom != null) {
          dispatch({ type: 'SET_LECT_ROOM', payload: { id, roomId: newRoom } });
        }
        dispatch({ type: 'SET_LECT_STATUS', payload: { id, status, note: cleanNote } });

        // writeOverrides reads stateRef.current at fire time, which already has
        // the room change applied, so no explicit lrooms patch is needed.
        schedulePendingWrite(
          () => writeOverrides({ lstatus: newLstatus, lnotes: newLnotes }),
          snap,
          'Status updated · Students notified',
          `status-${id}`,
        );
        return;
      }

      case 'SET_LECT_ROOM': {
        // Standalone room change (not combined with status).
        const { id, roomId } = action.payload;
        if (!id || !roomId) return;
        const snap = { lrooms: { ...s.lrooms } };
        const newLrooms = { ...s.lrooms, [id]: roomId };

        dispatch(action);
        schedulePendingWrite(
          () => writeOverrides({ lrooms: newLrooms }),
          snap,
          'Room changed · Students notified',
          `room-${id}`,
        );
        return;
      }

      case 'ADD_BOOKING': {
        const { booking, roomId } = action.payload;
        if (!booking?.id || !roomId) return;
        const endM = t2m(booking.startTime) + booking.durationM;
        const cleanBooking = {
          ...booking,
          purpose: sanitise(booking.purpose ?? '', 100),
          note:    sanitise(booking.note    ?? '', 300),
        };
        const snap = {
          bookings:     [...s.bookings],
          roomStatuses: { ...s.roomStatuses },
        };
        const newRoomStatuses = {
          ...s.roomStatuses,
          [roomId]: { st: 'occ', occ: cleanBooking.size || 5, fu: m2t(endM), nl: null },
        };
        const bookingWithDay = { ...cleanBooking, day: s.selDay };

        dispatch({ type: 'ADD_BOOKING', payload: { booking: cleanBooking, roomId } });
        schedulePendingWrite(
          () => {
            setDoc(doc(db, 'bookings', cleanBooking.id), bookingWithDay).catch(() => {});
            writeOverrides({ roomStatuses: newRoomStatuses });
          },
          snap,
          `${roomId} booked · ${cleanBooking.startTime}–${m2t(endM)}`,
          `add-booking-${roomId}`,
        );
        return;
      }

      case 'CANCEL_BOOKING': {
        const target = s.bookings.find(b => b.id === action.payload);
        if (!target) return;
        const snap = {
          bookings:     [...s.bookings],
          roomStatuses: { ...s.roomStatuses },
        };
        const newRS = { ...s.roomStatuses };
        delete newRS[target.room];

        dispatch(action);
        schedulePendingWrite(
          () => {
            deleteDoc(doc(db, 'bookings', target.id)).catch(() => {});
            writeOverrides({ roomStatuses: newRS });
          },
          snap,
          'Booking cancelled',
          `cancel-booking-${target.id}`,
        );
        return;
      }

      case 'ADD_GROUP': {
        const g = action.payload;
        if (!g?.id || !g?.sub?.trim() || !g?.room) return;
        const cleanGroup = { ...g, sub: sanitise(g.sub, 120) };
        dispatch({ type: 'ADD_GROUP', payload: cleanGroup });
        setDoc(doc(db, 'groups', cleanGroup.id), cleanGroup).catch(() => {});
        return;
      }

      case 'JOIN_GROUP': {
        const g = s.groups.find(x => x.id === action.payload);
        dispatch(action);
        if (g && !g.joined) {
          updateDoc(doc(db, 'groups', g.id), { mem: g.mem + 1, joined: true }).catch(() => {});
        }
        return;
      }

      case 'LEAVE_GROUP': {
        const g = s.groups.find(x => x.id === action.payload);
        dispatch(action);
        if (g) {
          updateDoc(doc(db, 'groups', g.id), { mem: Math.max(0, g.mem - 1), joined: false }).catch(() => {});
        }
        return;
      }

      case 'DELETE_GROUP':
        dispatch(action);
        deleteDoc(doc(db, 'groups', action.payload)).catch(() => {});
        return;

      default:
        dispatch(action);
    }
  }, [writeOverrides, schedulePendingWrite]);

  // ── Firestore → local: real-time listeners with exponential backoff ────────

  useEffect(() => {
    function subscribeWithRetry(refOrQuery, handler, retries = 0) {
      let unsub = onSnapshot(refOrQuery,
        (snap) => {
          retries = 0;
          handler(snap);
          dispatch({ type: 'SET_HYDRATED' });
        },
        () => {
          const delay = Math.min(1000 * 2 ** retries, 30_000);
          setTimeout(() => {
            unsub();
            unsub = subscribeWithRetry(refOrQuery, handler, retries + 1);
          }, delay);
        },
      );
      return unsub;
    }

    const unsubOverrides = subscribeWithRetry(overridesRef, snap => {
      if (!snap.exists()) {
        setDoc(overridesRef, { lstatus: {}, lnotes: {}, lrooms: {}, roomStatuses: {} }).catch(() => {});
        return;
      }
      const { lstatus, lnotes, lrooms, roomStatuses } = snap.data();
      dispatch({ type: 'HYDRATE', payload: { lstatus, lnotes, lrooms, roomStatuses } });
    });

    const unsubGroups = subscribeWithRetry(groupsCol, snap => {
      if (snap.empty) {
        setDoc(doc(db, 'groups', 'g1'), SEED_GROUP).catch(() => {});
        return;
      }
      dispatch({ type: 'HYDRATE', payload: { groups: snap.docs.map(d => d.data()) } });
    });

    const unsubBookings = subscribeWithRetry(bookingsCol, snap => {
      dispatch({ type: 'HYDRATE', payload: { bookings: snap.docs.map(d => d.data()) } });
    });

    return () => { unsubOverrides(); unsubGroups(); unsubBookings(); };
  }, []);

  // ── Reset all changes to seed state ──────────────────────────────────────

  const resetToDefaults = useCallback(async () => {
    // Abort any pending write — we're wiping everything, so there's nothing to commit.
    if (pendingRef.current) {
      clearTimeout(pendingRef.current.timer);
      pendingRef.current = null;
    }
    dispatch({ type: 'RESET' });
    try {
      await setDoc(overridesRef, { lstatus: {}, lnotes: {}, lrooms: {}, roomStatuses: {} });
      const [bSnap, gSnap] = await Promise.all([getDocs(bookingsCol), getDocs(groupsCol)]);
      await Promise.all([
        ...bSnap.docs.map(d => deleteDoc(d.ref)),
        ...gSnap.docs.map(d => deleteDoc(d.ref)),
      ]);
      await setDoc(doc(db, 'groups', 'g1'), SEED_GROUP);
      dispatch({ type: 'SHOW_TOAST', payload: 'Reset to defaults' });
    } catch {
      dispatch({ type: 'SHOW_TOAST', payload: 'Reset failed — check connection' });
    }
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch: fbDispatch, resetToDefaults, undo: handleUndo }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
