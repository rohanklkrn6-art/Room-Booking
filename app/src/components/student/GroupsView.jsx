import { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ConfirmModal from '../ConfirmModal';

export default function GroupsView() {
  const { state, dispatch } = useApp();
  const { groups } = state;
  const [deleteTarget, setDeleteTarget] = useState(null); // group id pending delete

  return (
    <div className="content">
      <button
        className="tab-add-btn"
        onClick={() => dispatch({ type: 'OPEN_SHEET', payload: { sheetType: 'createGroup', sheetData: {} } })}
      >
        + Create group
      </button>

      {groups.length === 0 && (
        <div className="no-res">No study groups yet — create one above</div>
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
              <button className="btn-leave" onClick={() => setDeleteTarget(g.id)}>
                Delete
              </button>
            ) : g.joined ? (
              <button
                className="btn-leave"
                onClick={() => dispatch({ type: 'LEAVE_GROUP', payload: g.id })}
              >
                Leave
              </button>
            ) : g.mem >= g.max ? (
              <span style={{ fontSize: 11, color: '#999', fontFamily: 'Inter, sans-serif' }}>Full</span>
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

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete this study group?"
        body="This will remove the group for everyone. This cannot be undone."
        confirmLabel="Delete"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          dispatch({ type: 'DELETE_GROUP', payload: deleteTarget });
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
