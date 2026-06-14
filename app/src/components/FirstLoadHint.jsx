import { useState, useEffect } from 'react';

export default function FirstLoadHint() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;
  return (
    <div className="hint-overlay" onClick={() => setVisible(false)}>
      <div className="hint-box">
        <div className="hint-title">Welcome to Smart Timetable</div>
        <div className="hint-body">Tap <strong>Student</strong> or <strong>Professor</strong> above to switch views</div>
        <div className="hint-dismiss">Tap anywhere to dismiss</div>
      </div>
    </div>
  );
}
