// Student's personal timetable — only the lectures this student is enrolled in.
// The schedule repeats weekly throughout the regular semester (up to 15 July 2026).
// Professors: Wagner (Intl Business Strategy + Intercultural Comm),
//             Schmidt (Intl Finance + SAP ManFin), Smith (Business English),
//             Huber (ERP Systems).
export const LECTS = {
  // Monday
  0: [
    { id: 'lm1', sub: 'International Business Strategy', room: 'B0.01', prof: 'Prof. Wagner',  t: '09:45', e: '11:15', n: 120 },
    { id: 'lm2', sub: 'SAP ManFin',                      room: 'B203',  prof: 'Prof. Schmidt', t: '13:45', e: '15:15', n: 22  },
  ],
  // Tuesday
  1: [
    { id: 'lt1', sub: 'International Finance',            room: 'A1.14', prof: 'Prof. Schmidt', t: '09:45', e: '11:15', n: 22  },
    { id: 'lt2', sub: 'Business English',                 room: 'A0.13', prof: 'Ms. Smith',     t: '13:45', e: '15:15', n: 20  },
  ],
  // Wednesday — demo day (DEMO_TODAY_IDX = 2, DEMO_NOW_M = 720 / 12:00)
  // lw1 is happening, lw2 is cancelled (→ A0.13 free alert), lw3 is online
  2: [
    { id: 'lw1', sub: 'ERP Systems',                      room: 'B1.05', prof: 'Prof. Huber',   t: '09:45', e: '11:15', n: 22  },
    { id: 'lw2', sub: 'Business English for Managers',    room: 'A0.13', prof: 'Ms. Smith',     t: '11:30', e: '13:00', st: 'cancelled', n: 20 },
    { id: 'lw3', sub: 'Intercultural Communication',      room: 'A2.10', prof: 'Prof. Wagner',  t: '13:45', e: '15:15', st: 'online',    n: 24 },
  ],
  // Thursday
  3: [
    { id: 'ld1', sub: 'SAP ManFin',                       room: 'B203',  prof: 'Prof. Schmidt', t: '09:45', e: '11:15', n: 22  },
    { id: 'ld2', sub: 'ERP Systems (Seminar)',             room: 'B1.10', prof: 'Prof. Huber',   t: '13:45', e: '15:15', n: 20  },
  ],
  // Friday
  4: [
    { id: 'lf1', sub: 'International Business Strategy (Seminar)', room: 'A1.02', prof: 'Prof. Wagner', t: '09:45', e: '11:15', n: 22 },
    { id: 'lf2', sub: 'International Finance',             room: 'A1.14', prof: 'Prof. Schmidt', t: '13:45', e: '15:15', n: 22  },
  ],
};

// Full room schedule for all buildings — every room, every slot.
// Used exclusively by getRoomStatus to derive room availability from the timetable.
// Only day 2 (Wednesday, the demo day) needs complete coverage because getRoomStatus
// performs time-based derivation only when isToday === true (wkOff=0, selDay=2).
// Other days fall back to ambient IoT data for non-today views.
export const ALL_LECTS = {
  ...LECTS,
  2: [
    // ── Student's own lectures (IDs preserved for lstatus / lnotes keying) ──
    { id: 'lw1', sub: 'ERP Systems',                      room: 'B1.05', prof: 'Prof. Huber',  t: '09:45', e: '11:15', n: 22 },
    { id: 'lw2', sub: 'Business English for Managers',    room: 'A0.13', prof: 'Ms. Smith',    t: '11:30', e: '13:00', st: 'cancelled', n: 20 },
    { id: 'lw3', sub: 'Intercultural Communication',      room: 'A2.10', prof: 'Prof. Wagner', t: '13:45', e: '15:15', st: 'online',    n: 24 },

    // ── Building A, floor 0 ──
    { id: 'r_a001', sub: 'Human Resource Management',     room: 'A0.01', t: '09:45', e: '11:15', n: 22 },
    { id: 'r_a002', sub: 'Marketing Management',          room: 'A0.05', t: '11:30', e: '13:00', n: 65 },
    { id: 'r_a003', sub: 'Accounting Fundamentals',       room: 'A0.09', t: '09:45', e: '11:15', n: 18 },
    { id: 'r_a004', sub: 'Accounting Fundamentals',       room: 'A0.09', t: '13:45', e: '15:15', n: 18 },
    // A0.13: only lw2 (cancelled above) — no other lecture in this slot

    // ── Building A, floor 1 ──
    { id: 'r_a005', sub: 'Business Communication',        room: 'A1.02', t: '09:45', e: '11:15', n: 22 },
    { id: 'r_a006', sub: 'Business Communication',        room: 'A1.02', t: '13:45', e: '15:15', n: 22 },
    { id: 'r_a007', sub: 'Business Analytics',            room: 'A1.06', t: '11:30', e: '13:00', n: 24 },
    { id: 'r_a008', sub: 'Corporate Strategy',            room: 'A1.10', t: '09:45', e: '11:15', n: 28 },
    { id: 'r_a009', sub: 'Corporate Strategy',            room: 'A1.10', t: '13:45', e: '15:15', n: 28 },
    { id: 'r_a010', sub: 'Corporate Governance',          room: 'A1.14', t: '11:30', e: '13:00', n: 26 },

    // ── Building A, floor 2 ──
    { id: 'r_a011', sub: 'Marketing Research',            room: 'A2.05', t: '11:30', e: '13:00', n: 26 },
    // A2.08: no lectures today (free all day)
    // A2.10: lw3 (online) above — room is free
    { id: 'r_a012', sub: 'Innovation Management',         room: 'A2.15', t: '13:45', e: '15:15', n: 20 },

    // ── Building A, floor 3 ──
    { id: 'r_a013', sub: 'Business Ethics',               room: 'A3.01', t: '09:45', e: '11:15', n: 22 },
    { id: 'r_a014', sub: 'Business Ethics',               room: 'A3.01', t: '15:30', e: '17:00', n: 22 },
    { id: 'r_a015', sub: 'Project Management',            room: 'A3.07', t: '11:30', e: '13:00', n: 28 },
    { id: 'r_a016', sub: 'Innovation Management',         room: 'A3.12', t: '13:45', e: '15:15', n: 18 },

    // ── Building A, floor 4 ──
    { id: 'r_a017', sub: 'Entrepreneurship',              room: 'A4.03', t: '09:45', e: '11:15', n: 24 },
    { id: 'r_a018', sub: 'Entrepreneurship',              room: 'A4.03', t: '15:30', e: '17:00', n: 24 },
    { id: 'r_a019', sub: 'Risk Management',               room: 'A4.08', t: '11:30', e: '13:00', n: 22 },
    { id: 'r_a020', sub: 'Leadership & Organisation',     room: 'A4.11', t: '09:45', e: '11:15', n: 28 },
    { id: 'r_a021', sub: 'Leadership & Organisation',     room: 'A4.11', t: '13:45', e: '15:15', n: 28 },

    // ── Building B ──
    { id: 'r_b001', sub: 'Industrial Management',         room: 'B0.01', t: '11:30', e: '13:00', n: 130 },
    { id: 'r_b002', sub: 'Industrial Management',         room: 'B0.01', t: '15:30', e: '17:00', n: 130 },
    { id: 'r_b003', sub: 'Quantitative Methods',          room: 'B0.09', t: '09:45', e: '11:15', n: 85  },
    { id: 'r_b004', sub: 'Economics Seminar',             room: 'B0.09', t: '15:30', e: '17:00', n: 75  },
    { id: 'r_b005', sub: 'Business Law',                  room: 'B0.12', t: '11:30', e: '13:00', n: 22  },
    // B1.05: lw1 (ERP Systems) above + Supply Chain in afternoon
    { id: 'r_b006', sub: 'Supply Chain Management',       room: 'B1.05', t: '15:30', e: '17:00', n: 25  },
    { id: 'r_b007', sub: 'Operations Management',         room: 'B1.10', t: '09:45', e: '11:15', n: 20  },
    { id: 'r_b008', sub: 'Operations Management',         room: 'B1.10', t: '13:45', e: '15:15', n: 20  },
    { id: 'r_b009', sub: 'International Trade',           room: 'B203',  t: '11:30', e: '13:00', n: 25  },
    { id: 'r_b010', sub: 'Financial Accounting',          room: 'B2.14', t: '09:45', e: '11:15', n: 18  },
    { id: 'r_b011', sub: 'Financial Accounting',          room: 'B2.14', t: '15:30', e: '17:00', n: 18  },

    // ── Building C ──
    { id: 'r_c001', sub: 'Digital Marketing',             room: 'C0.08', t: '09:45', e: '11:15', n: 22  },
    { id: 'r_c002', sub: 'Digital Marketing',             room: 'C0.08', t: '13:45', e: '15:15', n: 22  },
    { id: 'r_c003', sub: 'Environmental Economics',       room: 'C0.12', t: '11:30', e: '13:00', n: 20  },
    // C1.01 (Silentium) and C1.05 (Study Room): no scheduled lectures — always open
    { id: 'r_c004', sub: 'Strategic Analytics',           room: 'C1.10', t: '11:30', e: '13:00', n: 28  },
    { id: 'r_c005', sub: 'Corporate Finance',             room: 'C2.03', t: '09:45', e: '11:15', n: 18  },
    { id: 'r_c006', sub: 'Corporate Finance',             room: 'C2.03', t: '15:30', e: '17:00', n: 18  },
  ],
};

// Days where the student has lecture status changes — drives the orange dot on the calendar.
export const CHANGE_DAYS = { 2: true };
