
import React, { useState, useEffect } from 'react';
import Pill from '../components/Pill';
import { getStudents, blacklistStudent, liftBlacklist, blacklistManualStudent, deleteStudent, addPoints,
removePoints, getPointsHistory } from '../services/api';

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '20px', padding: '24px', width: '420px', maxWidth: '95vw',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--muted)', borderRadius: '10px', padding: '6px 12px',
            cursor: 'pointer', fontSize: '1rem',
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}


const inputStyle = {
  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: '12px', padding: '12px 16px', color: 'var(--text)',
  fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', outline: 'none',
  transition: 'border-color 0.2s', marginTop: '8px'
};

export default function BlacklistPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [targetStudent, setTargetStudent] = useState(null);

  const [showPointsModal,
  setShowPointsModal] =
  useState(false);

  const [successMessage,
  setSuccessMessage] =
  useState('');

const [selectedStudent,
  setSelectedStudent] =
  useState(null);

const [pointsAction,
  setPointsAction] =
  useState('add');

const [pointsForm,
  setPointsForm] =
  useState({
    points: '',
    reason: ''
  });

const [pointsHistory,
  setPointsHistory] =
  useState([]);
  
  // States for manual entry
  const [manualData, setManualData] = useState({ universityId: '', name: '', email: '', reason: '' });
  
  // Existing blacklist state
  const [reason, setReason] = useState('');
  const [until, setUntil] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getStudents();
      setStudents(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }


  async function openPointsModal(
  student,
  action
) {

  setSelectedStudent(student);

  setPointsAction(action);

  setPointsForm({
    points: '',
    reason: ''
  });



  try {

    const res =
      await getPointsHistory(
        student.id
      );

    setPointsHistory(
      res.data
    );

  } catch (err) {

    console.error(err);
  }

  setShowPointsModal(true);
}

async function handlePointsAction() {

  try {

    const payload = {
      userId: selectedStudent.id,
      points:
        Number(pointsForm.points),
      reason:
        pointsForm.reason
    };

    if (
      pointsAction === 'add'
    ) {

      await addPoints(payload);

    } else {

      await removePoints(payload);
    }

    // Refresh students
    await loadData();

    setSelectedStudent(prev => ({
  ...prev,
  points:
    pointsAction === 'add'
      ? prev.points +
        Number(pointsForm.points)
      : prev.points -
        Number(pointsForm.points)
}));

    // Refresh history
    const res =
      await getPointsHistory(
        selectedStudent.id
      );

    setPointsHistory(
      res.data
    );

    setPointsForm({
      points: '',
      reason: ''
    });

    setShowPointsModal(false);

setSuccessMessage(
  pointsAction === 'add'
    ? '✅ Points added successfully'
    : '✅ Points removed successfully'
);

setTimeout(() => {
  setSuccessMessage('');
}, 3000);

  } catch (err) {

    console.error(err);

    alert(
      err.response?.data?.message
      || 'Operation failed'
    );
  }
}

  // Auto-generate email logic for manual entry
  function handleManualNameChange(name) {
    const cleanName = name.replace(/\s+/g, '');
    let email = manualData.email;
    if (name && (!email || email.includes('@cit.just.edu.jo'))) {
      const randomDigits = Math.floor(10 + Math.random() * 90);
      email = `${cleanName}${randomDigits}@cit.just.edu.jo`;
    }
    setManualData({ ...manualData, name, email });
  }

  async function handleManualSubmit() {
    if (!manualData.universityId || !manualData.name || !manualData.reason) {
      alert('Please fill in all mandatory fields.');
      return;
    }
    if (manualData.universityId.length !== 6) {
      alert('Student ID must be exactly 6 digits.');
      return;
    }
    setSaving(true);
    try {
      await blacklistManualStudent({
  email: manualData.email,
  reason: manualData.reason
});
      setShowManualModal(false);
      setManualData({ universityId: '', name: '', email: '', reason: '' });
      await loadData();
    } catch (e) {
      const msg = e.response?.data?.error || e.message || 'Error occurred';
      alert(`Manual Blacklist Failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleBlacklist() {
    if (!reason.trim()) return;
    setSaving(true);
    try {
      await blacklistStudent(
  targetStudent.id,
  {
    reason,
    until: until || null
  }
);
      setShowBlacklistModal(false);
      setReason('');
setUntil('');
setTargetStudent(null);
      await loadData();
    } catch (e) {
      alert('Failed to blacklist student.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLift(id) {
    if (!window.confirm('Are you sure you want to restore access for this student?')) return;
    try {
      await liftBlacklist(id);
      await loadData();
    } catch (e) {
      alert('Failed to lift blacklist.');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to permanently delete this student record? This action cannot be undone.')) return;
    try {
      await deleteStudent(id);
      await loadData();
    } catch (e) {
      alert('Failed to delete student record.');
    }
  }

  const filtered = students.filter(s => {

  const q = search.toLowerCase();

  return (
    s.name?.toLowerCase().includes(q) ||
    String(s.id).includes(q) ||
    s.email?.toLowerCase().includes(q)
  );
});

  return (
    <div className="content">

  {successMessage && (

    <div style={{
      background:
        'rgba(34,197,94,.12)',
      border:
        '1px solid rgba(34,197,94,.2)',
      color: '#4ade80',
      padding: '12px 16px',
      borderRadius: '12px',
      marginBottom: '18px',
      fontWeight: 600
    }}>

      {successMessage}

    </div>

  )}
      <div className="toolbar" style={{ display: 'flex', gap: '24px', alignItems: 'center', marginBottom: '24px' }}>
        <button 
          className="btn btn-danger" 
          onClick={() => setShowManualModal(true)}
          style={{ padding: '12px 24px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          🚨 Blacklist Student
        </button>

        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <input
            placeholder="Search by ID, name or email..."
            className="search-input"
            style={{ 
              width: '100%',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '12px 16px 12px 42px', color: 'var(--text)',
              outline: 'none', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
        </div>
      </div>

      <div className="panel" style={{ borderRadius: '24px', padding: '24px' }}>
        <div className="panel-header" style={{ marginBottom: '24px' }}>
          <div className="panel-title" style={{ fontSize: '1.2rem' }}>⤷ Student Control Center</div>
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{students.length} students registered</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px', color: 'var(--muted)', fontSize: '1rem', fontStyle: 'italic' }}>⏳ Syncing with security database...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ padding: '12px 16px' }}>Student ID</th>
                <th style={{ padding: '12px 16px' }}>Full Name & Email</th>
                <th style={{ padding: '12px 16px' }}>Student Status</th>
                <th style={{ padding: '12px 16px' }}>Incident Context</th>
                <th style={{ padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: '60px' }}>
                    No student matching your search criteria.
                  </td>
                </tr>
              )}
              {filtered.map(student => (
                <tr key={student.id} style={{ opacity: student.is_blacklisted ? 0.8 : 1 }}>
                  <td style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem', padding: '16px' }}>
                    #{student.id}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{student.name}</div>
                    <div style={{
  marginTop: '6px',
  fontSize: '.75rem',
  color: '#fbbf24',
  fontWeight: 700
}}>
  ⭐ {student.points || 0} pts
</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{student.email}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <Pill status={ student.is_blacklisted ? 'blacklisted' : 'active'}/>
                  </td>
                  <td style={{ maxWidth: '300px', padding: '16px' }}>
                    {student.is_blacklisted ? (
                      <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <div style={{ fontSize: '0.82rem', color: 'var(--accent3)', fontWeight: 600 }}>⚠️ {student.blacklist_reason}</div>
                        {student.blacklist_until && (
  <div style={{
    fontSize: '0.72rem',
    color: '#f59e0b',
    marginTop: '6px'
  }}>
    Until: {
      new Date(
        student.blacklist_until
      ).toLocaleDateString()
    }
  </div>
)}
                        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: '4px' }}>
                          Suspended: {student.created_at ? new Date(student.created_at).toLocaleDateString() : 'Active block'}
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>Clean record</span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {student.is_blacklisted ? (
                        <button
                          className="btn btn-ghost"
                          style={{ color: 'var(--accent2)', fontSize: '0.75rem', padding: '8px 16px', borderRadius: '10px' }}
                          onClick={() => handleLift(student.id)}
                        >
                          Restore Access
                        </button>
                      ) : (
                        <button
                          className="btn btn-danger"
                          style={{ fontSize: '0.75rem', padding: '8px 16px', borderRadius: '10px' }}
                          onClick={() => {
                            setTargetStudent(student);
                            setShowBlacklistModal(true);
                          }}
                        >
                          🚨 Block Access
                        </button>
                      )}

                      <div style={{
  display: 'flex',
  gap: '6px'
}}>

  <button
    className="btn btn-primary"
    style={{
      fontSize: '0.72rem',
      padding: '8px 12px',
      borderRadius: '10px'
    }}
    onClick={() =>
      openPointsModal(
        student,
        'add'
      )
    }
  >
    ➕ Add Points
  </button>

  <button
    className="btn btn-ghost"
    style={{
      fontSize: '0.72rem',
      padding: '8px 12px',
      borderRadius: '10px'
    }}
    onClick={() =>
      openPointsModal(
        student,
        'remove'
      )
    }
  >
    ➖ Remove Point
  </button>

</div>
                      
                      <button 
                        onClick={() => handleDelete(student.id)}
                        style={{ 
                          background: 'rgba(239, 68, 68, 0.1)', border: 'none', 
                          color: 'var(--accent3)', 
                          cursor: 'pointer', borderRadius: '8px', width: '32px', height: '32px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s', marginLeft: '4px'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = 'var(--accent3)';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.color = 'var(--accent3)';
                        }}
                        title="Delete Student Record"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <Modal title="👮 Manual Security Block" onClose={() => setShowManualModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>STUDENT ID (6 DIGITS)</label>
              <input
                placeholder="e.g. 154209"
                style={inputStyle}
                maxLength={6}
                value={manualData.universityId}
                onChange={e => setManualData({ ...manualData, universityId: e.target.value.replace(/\D/g, '') })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>FULL NAME</label>
              <input
                placeholder="Student full name..."
                style={inputStyle}
                value={manualData.name}
                onChange={e => handleManualNameChange(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>EMAIL ADDRESS</label>
              <input
                placeholder="e.g. YusufK98@cit.just.edu.jo"
                style={inputStyle}
                value={manualData.email}
                onChange={e => setManualData({ ...manualData, email: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>INCIDENT CONTEXT</label>
              <textarea
                style={{ ...inputStyle, minHeight: '100px', resize: 'none' }}
                placeholder="Detailed reason for the security block..."
                value={manualData.reason}
                onChange={e => setManualData({ ...manualData, reason: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button className="btn btn-ghost" style={{ flex: 1, padding: '14px', borderRadius: '12px' }} onClick={() => setShowManualModal(false)}>Cancel</button>
              <button 
                className="btn btn-danger" 
                style={{ flex: 1, padding: '14px', borderRadius: '12px' }} 
                onClick={handleManualSubmit}
                disabled={saving}
              >
                {saving ? '⏳ Saving...' : '🚨 Confirm Blacklist'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Existing Blacklist Modal */}
      {showBlacklistModal && (
        <Modal title={`👮 Block — ${targetStudent?.name}`} onClose={() => setShowBlacklistModal(false)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 600 }}>REASON FOR BLOCK</label>
              <textarea
                style={{ ...inputStyle, minHeight: '100px', resize: 'none' }}
                placeholder="Reason for suspending this account..."
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>

            <div>
  <label style={{
    display: 'block',
    fontSize: '0.75rem',
    color: 'var(--muted)',
    fontWeight: 600
  }}>
    BLACKLIST UNTIL (OPTIONAL)
  </label>

  <input
    type="date"
    style={inputStyle}
    value={until}
    onChange={e => setUntil(e.target.value)}
  />
</div>



            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-ghost" style={{ flex: 1, padding: '14px', borderRadius: '12px' }} onClick={() => {

  setShowBlacklistModal(false);

  setReason('');

  setUntil('');

  setTargetStudent(null);
}}>Cancel</button>
              <button
                className="btn btn-danger"
                style={{ flex: 1, padding: '14px', borderRadius: '12px' }}
                onClick={handleBlacklist}
                disabled={saving}
              >
                {saving ? '⏳ Blocking...' : '🚨 Confirm Block'}
              </button>
            </div>
          </div>
        </Modal>
      )}
      {/* Points Modal */}
{showPointsModal && (

  <Modal
    title={
      pointsAction === 'add'
        ? `🎁 Add Points — ${selectedStudent?.name}`
        : `➖ Remove Points — ${selectedStudent?.name}`
    }
    onClose={() =>
      setShowPointsModal(false)
    }
  >

    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>

      {/* Current Points */}

      <div style={{
        background:
          'rgba(59,130,246,.08)',
        border:
          '1px solid rgba(59,130,246,.15)',
        padding: '14px',
        borderRadius: '14px'
      }}>

        <div style={{
          fontSize: '.75rem',
          color: 'var(--muted)',
          marginBottom: '6px'
        }}>
          CURRENT BALANCE
        </div>

        <div style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--accent2)'
        }}>
          ⭐ {selectedStudent?.points || 0}
        </div>

      </div>

      {/* Amount */}

      <div>

        <label style={{
          display: 'block',
          fontSize: '.75rem',
          color: 'var(--muted)',
          fontWeight: 600
        }}>
          POINTS AMOUNT
        </label>

        <input
          type="number"
          placeholder="Enter points..."
          style={inputStyle}
          value={pointsForm.points}
          onChange={e =>
            setPointsForm(prev => ({
              ...prev,
              points:
                e.target.value
            }))
          }
        />

      </div>

      {/* Reason */}

      <div>

        <label style={{
          display: 'block',
          fontSize: '.75rem',
          color: 'var(--muted)',
          fontWeight: 600
        }}>
          REASON
        </label>

        <textarea
          style={{
            ...inputStyle,
            minHeight: '70px',
            resize: 'none'
          }}
          placeholder={
            pointsAction === 'add'
              ? 'Bonus reason...'
              : 'Penalty reason...'
          }
          value={pointsForm.reason}
          onChange={e =>
            setPointsForm(prev => ({
              ...prev,
              reason:
                e.target.value
            }))
          }
        />

      </div>

      {/* History */}

      <div>

        <div style={{
          fontSize: '.8rem',
          fontWeight: 700,
          marginBottom: '10px'
        }}>
          Recent Transactions
        </div>

        <div style={{
          maxHeight: '160px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>

          {pointsHistory.length === 0 ? (

            <div style={{
              color: 'var(--muted)',
              fontSize: '.8rem'
            }}>
              No transaction history
            </div>

          ) : (

            pointsHistory.map(tx => (

              <div
                key={tx.id}
                style={{
                  background:
                    'var(--surface2)',
                  border:
                    '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '10px'
                }}
              >

                <div style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  marginBottom: '4px'
                }}>

                  <div style={{
                    fontSize: '.8rem',
                    fontWeight: 700
                  }}>
                    {tx.type}
                  </div>

                  <div style={{
                    color:
                      tx.points > 0
                        ? '#22c55e'
                        : '#ef4444',
                    fontWeight: 700
                  }}>
                    {tx.points > 0
                      ? '+'
                      : ''}
                    {tx.points}
                  </div>

                </div>

                <div style={{
                  fontSize: '.72rem',
                  color: 'var(--muted)'
                }}>
                  {tx.created_at
                    ? new Date(
                        tx.created_at
                      ).toLocaleString()
                    : ''}
                </div>

              </div>

            ))

          )}

        </div>

      </div>

      {/* Actions */}

      <div style={{
        display: 'flex',
        gap: '12px',
        marginTop: '10px'
      }}>

        <button
          className="btn btn-ghost"
          style={{
            flex: 1,
            padding: '11px',
            borderRadius: '12px'
          }}
          onClick={() =>
            setShowPointsModal(false)
          }
        >
          Cancel
        </button>

        <button
          className={
            pointsAction === 'add'
              ? 'btn btn-primary'
              : 'btn btn-danger'
          }
          style={{
            flex: 1,
            padding: '14px',
            borderRadius: '12px'
          }}
          onClick={handlePointsAction}
        >
          {pointsAction === 'add'
            ? '🎁 Add Points'
            : '➖ Remove Points'}
        </button>

      </div>

    </div>

  </Modal>

)}
    </div>
  );
}
