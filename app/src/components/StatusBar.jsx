import { useState, useEffect } from 'react';

function nowTime() {
  return new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

export default function StatusBar() {
  const [time, setTime] = useState(nowTime);

  useEffect(() => {
    const tick = setInterval(() => setTime(nowTime()), 10000);
    return () => clearInterval(tick);
  }, []);

  return (
    <div className="status-bar">
      <span>{time}</span>
      <span>●●● WiFi</span>
    </div>
  );
}
