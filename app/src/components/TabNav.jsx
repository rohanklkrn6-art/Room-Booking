export default function TabNav({ tabs, activeTab, onTabChange }) {
  return (
    <div className="tab-nav">
      {tabs.map((tab, i) => (
        <div
          key={tab.label}
          className={`tab-item${i === activeTab ? ' active' : ''}`}
          onClick={() => onTabChange(i)}
        >
          {tab.label}
          {tab.dot && <span className="notif-dot" />}
        </div>
      ))}
    </div>
  );
}
