// Strip any HTML tags from user input to prevent XSS.
export function stripHtml(str) {
  return String(str ?? '').replace(/<[^>]*>/g, '').replace(/&[a-z#0-9]+;/gi, '').trim();
}

// Enforce a max character length.
export function limitLen(str, max) {
  return String(str ?? '').slice(0, max);
}

// Combined: strip HTML then truncate. Use before writing to Firestore or rendering.
export function sanitise(str, maxLen = 300) {
  return limitLen(stripHtml(str), maxLen);
}
