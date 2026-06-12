import { useApp } from '../../context/AppContext';

export default function GroupsView() {
  const { state, dispatch } = useApp();
  const { groups } = state;

  return (
    <div className="content">
      <button
        className="tab-add-btn"
        onClick={() => dispatch({ type: 'OPEN_SHEET', payload: { sheetType: 'createGroup', sheetData: {} } })}
      >
        + Create group
      </button>
      {groups.length === 0 && (
        <div className="no-res">No study groups yet</div>
      )}
      {groups.map(g => (
        <div key={g.id} className={`grp-card${g.mine ? ' mine' : ''}`}>
          <div className="gc-top">
            <div>
              <div className="gc-name">
                {g.sub}
                {g.mine && <span className="gc-mine-tag">Yours</span>}
              </div>
              <div className="gc-meta">📍 {g.room} · {g.time} · {g.mem}/{g.max} people</div>
            </div>
            {g.mine ? (
              <button
                className="btn-leave"
                onClick={() => dispatch({ type: 'DELETE_GROUP', payload: g.id })}
              >
                Delete
              </button>
            ) : g.joined ? (
              <button
                className="btn-leave"
                onClick={() => dispatch({ type: 'LEAVE_GROUP', payload: g.id })}
              >
                Leave
              </button>
            ) : (
              <button
                className="btn-join"
                onClick={() => dispatch({ type: 'JOIN_GROUP', payload: g.id })}
              >
                Join
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
