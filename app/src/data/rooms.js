export const ROOMS = [
  // ── BUILDING A — Seminar rooms across 5 floors ──
  // Floor 0
  { id: 'A0.01', b: 'A', f: 0, type: 'Seminar Room', cap: 25, feat: ['Projector', 'WiFi', 'Whiteboard'] },
  { id: 'A0.05', b: 'A', f: 0, type: 'Lecture Hall', cap: 80, feat: ['Projector', 'WiFi', 'Accessible'] },
  { id: 'A0.09', b: 'A', f: 0, type: 'Seminar Room', cap: 20, feat: ['Power', 'Projector', 'WiFi'] },
  { id: 'A0.13', b: 'A', f: 0, type: 'Seminar Room', cap: 25, feat: ['Power', 'Projector', 'WiFi', 'Whiteboard'] },
  // Floor 1
  { id: 'A1.02', b: 'A', f: 1, type: 'Seminar Room', cap: 25, feat: ['Power', 'Projector', 'WiFi'] },
  { id: 'A1.06', b: 'A', f: 1, type: 'Seminar Room', cap: 28, feat: ['Projector', 'WiFi', 'Whiteboard'] },
  { id: 'A1.10', b: 'A', f: 1, type: 'Seminar Room', cap: 30, feat: ['Power', 'Projector', 'WiFi'] },
  { id: 'A1.14', b: 'A', f: 1, type: 'Seminar Room', cap: 30, feat: ['Power', 'WiFi', 'Accessible', 'Whiteboard'] },
  // Floor 2
  { id: 'A2.05', b: 'A', f: 2, type: 'Seminar Room', cap: 30, feat: ['Projector', 'WiFi', 'Whiteboard'] },
  { id: 'A2.08', b: 'A', f: 2, type: 'Seminar Room', cap: 20, feat: ['Power', 'WiFi'] },
  { id: 'A2.10', b: 'A', f: 2, type: 'Seminar Room', cap: 35, feat: ['Power', 'Projector', 'WiFi'] },
  { id: 'A2.15', b: 'A', f: 2, type: 'Seminar Room', cap: 22, feat: ['Projector', 'WiFi', 'Whiteboard'] },
  // Floor 3
  { id: 'A3.01', b: 'A', f: 3, type: 'Seminar Room', cap: 25, feat: ['Power', 'Projector', 'WiFi'] },
  { id: 'A3.07', b: 'A', f: 3, type: 'Seminar Room', cap: 30, feat: ['Power', 'Projector', 'WiFi', 'Whiteboard'] },
  { id: 'A3.12', b: 'A', f: 3, type: 'Seminar Room', cap: 20, feat: ['Projector', 'WiFi'] },
  // Floor 4
  { id: 'A4.03', b: 'A', f: 4, type: 'Seminar Room', cap: 28, feat: ['Power', 'Projector', 'WiFi', 'Whiteboard'] },
  { id: 'A4.08', b: 'A', f: 4, type: 'Seminar Room', cap: 25, feat: ['Projector', 'WiFi'] },
  { id: 'A4.11', b: 'A', f: 4, type: 'Seminar Room', cap: 30, feat: ['Power', 'Projector', 'WiFi'] },

  // ── BUILDING B — Lecture halls + seminar rooms ──
  { id: 'B0.01', b: 'B', f: 0, type: 'Lecture Hall', cap: 150, feat: ['Projector', 'WiFi', 'Accessible'] },
  { id: 'B0.09', b: 'B', f: 0, type: 'Lecture Hall', cap: 100, feat: ['Projector', 'WiFi', 'Accessible'] },
  { id: 'B0.12', b: 'B', f: 0, type: 'Seminar Room', cap: 25,  feat: ['Power', 'WiFi', 'Whiteboard'] },
  { id: 'B1.05', b: 'B', f: 1, type: 'Seminar Room', cap: 30,  feat: ['Power', 'Projector', 'WiFi'] },
  { id: 'B1.10', b: 'B', f: 1, type: 'Seminar Room', cap: 25,  feat: ['Power', 'WiFi', 'Whiteboard'] },
  { id: 'B203',  b: 'B', f: 2, type: 'Seminar Room', cap: 30,  feat: ['Power', 'Projector', 'WiFi', 'Whiteboard'] },
  { id: 'B2.14', b: 'B', f: 2, type: 'Seminar Room', cap: 20,  feat: ['Power', 'WiFi'] },

  // ── BUILDING C — Library, Silentium, seminar rooms ──
  { id: 'C0.08', b: 'C', f: 0, type: 'Seminar Room', cap: 25,  feat: ['Power', 'Projector', 'WiFi'] },
  { id: 'C0.12', b: 'C', f: 0, type: 'Seminar Room', cap: 22,  feat: ['Projector', 'WiFi', 'Whiteboard'] },
  { id: 'C1.01', b: 'C', f: 1, type: 'Silentium',    cap: 45,  feat: ['Power', 'Quiet Zone', 'WiFi'] },
  { id: 'C1.05', b: 'C', f: 1, type: 'Study Room',   cap: 30,  feat: ['Power', 'Quiet Zone', 'WiFi'] },
  { id: 'C1.10', b: 'C', f: 1, type: 'Seminar Room', cap: 30,  feat: ['Power', 'Projector', 'WiFi'] },
  { id: 'C2.03', b: 'C', f: 2, type: 'Seminar Room', cap: 20,  feat: ['Power', 'WiFi', 'Whiteboard'] },
];

// IoT sensor data only — room status is always derived from lecture schedule, never stored here.
//
// ambientOcc: sensor count when no lecture is running (self-study, early arrivals, stragglers)
// iot:        8 readings at 15-min intervals: 10:00, 10:15, 10:30, 10:45, 11:00, 11:15, 11:30, 11:45
//             Snapshot for the demo Wednesday scenario (12:00 now).
export const RS = {
  // ── BUILDING A, floor 0 ──

  'A0.01': { ambientOcc: 2, iot: [20, 22, 21, 21, 20, 14,  4,  2] },
  // ^ Human Resource Mgmt (09:45–11:15) just ended. Cleared out; 2 students lingering.

  'A0.05': { ambientOcc: 0,  iot: [ 0,  0,  2,  6, 15, 45, 65, 65] },
  // ^ Marketing Management (11:30–13:00) filling fast. Now 65/80.

  'A0.09': { ambientOcc: 3,  iot: [18, 19, 18, 18, 18, 12,  4,  3] },
  // ^ Accounting Fundamentals (09:45–11:15) ended; 3 stragglers. Next: 13:45.

  'A0.13': { ambientOcc: 0,  iot: [ 2,  2,  2,  3,  2,  7,  3,  0] },
  // ^ Business English CANCELLED. A few early arrivals left when they got the notification.

  // ── BUILDING A, floor 1 ──

  'A1.02': { ambientOcc: 4,  iot: [24, 23, 23, 22, 20, 12,  5,  4] },
  // ^ Business Communication (09:45–11:15) ended. 4 students still chatting. Next: 13:45.

  'A1.06': { ambientOcc: 0,  iot: [ 0,  0,  2,  4,  8, 12, 20, 24] },
  // ^ Business Analytics (11:30–13:00) filling up. 24/28 already seated.

  'A1.10': { ambientOcc: 3,  iot: [26, 28, 27, 27, 26, 15,  5,  3] },
  // ^ Corporate Strategy (09:45–11:15) ended. Next slot: 13:45. Cleared out quickly.

  'A1.14': { ambientOcc: 0,  iot: [ 0,  0,  2,  7, 14, 22, 26, 26] },
  // ^ Corporate Governance (11:30–13:00) in progress. 26/30.

  // ── BUILDING A, floor 2 ──

  'A2.05': { ambientOcc: 0,  iot: [ 0,  0,  2,  5, 10, 15, 22, 26] },
  // ^ Marketing Research (11:30–13:00) in progress and filling. 26/30.

  'A2.08': { ambientOcc: 0,  iot: [ 5,  4,  2,  1,  0,  0,  0,  0] },
  // ^ No lectures today. Early self-study visitors left by 10:45.

  'A2.10': { ambientOcc: 5,  iot: [32, 30, 10,  6,  5,  5,  5,  5] },
  // ^ Intercultural Communication moved online at 13:45. Informal morning group cleared out
  //   after the online-switch notification. 5 students using it informally.

  'A2.15': { ambientOcc: 2,  iot: [ 3,  2,  2,  2,  2,  2,  2,  2] },
  // ^ No morning lecture. Low ambient self-study. Next: Innovation Management 13:45.

  // ── BUILDING A, floor 3 ──

  'A3.01': { ambientOcc: 0,  iot: [20, 22, 22, 21, 20, 12,  4,  0] },
  // ^ Business Ethics (09:45–11:15) ended and room is empty. Next lecture: 15:30.

  'A3.07': { ambientOcc: 0,  iot: [ 0,  1,  3,  5,  8, 12, 22, 28] },
  // ^ Project Management (11:30–13:00) in progress. 28/30 — nearly full.

  'A3.12': { ambientOcc: 0,  iot: [ 0,  0,  0,  2,  3,  2,  0,  0] },
  // ^ No morning lecture. Occasional visitor. Next: Innovation Management 13:45.

  // ── BUILDING A, floor 4 ──

  'A4.03': { ambientOcc: 2,  iot: [22, 24, 23, 22, 22, 14,  4,  2] },
  // ^ Entrepreneurship (09:45–11:15) ended. Most left. Next: 15:30.

  'A4.08': { ambientOcc: 0,  iot: [ 0,  0,  2,  4,  8, 10, 18, 22] },
  // ^ Risk Management (11:30–13:00) filling up. 22/25.

  'A4.11': { ambientOcc: 3,  iot: [25, 27, 28, 27, 26, 15,  5,  3] },
  // ^ Leadership (09:45–11:15) ended. Cleared out; next slot 13:45.

  // ── BUILDING B ──

  'B0.01': { ambientOcc: 0,  iot: [ 0,  5, 10, 20, 40, 80, 115, 130] },
  // ^ Industrial Management (11:30–13:00). Large hall filling steadily. 130/150.

  'B0.09': { ambientOcc: 15, iot: [88, 90, 86, 90, 88, 80, 20, 15] },
  // ^ Quantitative Methods (09:45–11:15) just ended. 15 people still packing up.
  //   Next: Economics Seminar 15:30.

  'B0.12': { ambientOcc: 0,  iot: [ 0,  0,  3,  8, 15, 20, 22, 22] },
  // ^ Business Law (11:30–13:00) in progress. 22/25.

  'B1.05': { ambientOcc: 5,  iot: [26, 26, 25, 25, 24, 14,  7,  5] },
  // ^ ERP Systems (09:45–11:15) ended. 5 students still there. Next: 15:30.

  'B1.10': { ambientOcc: 2,  iot: [22, 21, 22, 21, 20,  8,  3,  2] },
  // ^ Operations Management (09:45–11:15) ended. Quiet. Next: 13:45.

  'B203':  { ambientOcc: 0,  iot: [ 0,  0,  4, 12, 18, 22, 25, 25] },
  // ^ International Trade (11:30–13:00) in progress. 25/30.

  'B2.14': { ambientOcc: 2,  iot: [18, 17, 16, 16, 15,  8,  3,  2] },
  // ^ Financial Accounting (09:45–11:15) ended. Very quiet. Next: 15:30.

  // ── BUILDING C ──

  'C0.08': { ambientOcc: 0,  iot: [ 0, 20, 19,  4,  1,  0,  0,  0] },
  // ^ Digital Marketing (09:45–11:15) had a slow start; cleared early. Next: 13:45.

  'C0.12': { ambientOcc: 0,  iot: [ 0,  0,  2,  5,  8, 12, 16, 20] },
  // ^ Environmental Economics (11:30–13:00) filling. 20/22.

  'C1.01': { ambientOcc: 38, iot: [28, 30, 33, 36, 38, 40, 42, 42] },
  // ^ Silentium open-study — fills steadily through the morning. 42/45. No lectures.

  'C1.05': { ambientOcc: 22, iot: [16, 17, 18, 19, 20, 21, 22, 22] },
  // ^ Quiet study room — moderate, growing. 22/30. No scheduled lectures.

  'C1.10': { ambientOcc: 0,  iot: [ 0,  0,  3, 10, 16, 22, 28, 28] },
  // ^ Strategic Analytics (11:30–13:00) in progress. 28/30.

  'C2.03': { ambientOcc: 2,  iot: [18, 17, 16, 15, 15,  8,  3,  2] },
  // ^ Corporate Finance (09:45–11:15) ended. 2 students still here. Next: 15:30.
};
