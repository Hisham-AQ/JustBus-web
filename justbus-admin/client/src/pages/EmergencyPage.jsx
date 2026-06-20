
import React, { useState, useEffect, useMemo } from 'react';
import { getAlerts, resolveAlert } from '../services/api';
import EmergencyMap from '../components/EmergencyMap';



const DISPATCH_OPTIONS = [
  { id: 'sec', name: 'University Security (Direct)', type: 'Emergency', icon: '👮‍♂️' },
  { id: 'civ', name: 'Civil Defense (JUST HQ)', type: 'Emergency', icon: '🚒' },
  { id: 'med', name: 'Medical Response Team', type: 'Emergency', icon: '🚑' },
  { id: 'b04', name: 'Bus #04 (Idle - 0.8km)', type: 'Backup', icon: '🚌' },
  { id: 'b09', name: 'Bus #09 (Idle - 1.2km)', type: 'Backup', icon: '🚌' }
];

export default function EmergencyPage() {
  const [alerts, setAlerts] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  // Modals / Menus
  const [activeDispatchAlert, setActiveDispatchAlert] = useState(null);
  const [activeContactAlert, setActiveContactAlert] = useState(null);
  const [activeResolveAlert, setActiveResolveAlert] = useState(null);
  const [reportText, setReportText] = useState('');
  const [resolveError, setResolveError] = useState('');

  useEffect(() => {
  loadAlerts();
}, []);

console.log(alerts);

async function loadAlerts() {
  try {
    const res = await getAlerts();

    const formatted = res.data.map(alert => ({
      id: alert.id,
      type: alert.issue_type,
      vehicleId: alert.plate_number || "Unknown Bus",
      location: `${alert.from_city || ""} → ${alert.to_city || ""}`,
      lat: Number(alert.lat),
      lng: Number(alert.lng),
      severity: "Critical",
      details: alert.note,
      userName: alert.userName,
      userPhone: alert.userPhone,
      created_at: alert.created_at
    }));

    console.log("ALERTS FROM BACKEND:", res.data);

    console.log("FORMATTED ALERTS:", formatted);
    setAlerts(formatted);

  } catch (err) {
    console.error("LOAD ALERTS ERROR:", err);
  }
}

  // Transitions
  const mapIncidents = useMemo(() => {
  if (selectedIncident) {
    return [selectedIncident];
  }
  return alerts.length > 0 ? [alerts[0]] : [];
  }, [alerts, selectedIncident]);


const handleResolve = async () => {
  try {

    await resolveAlert(
      activeResolveAlert.id
    );

    setAlerts(prev =>
      prev.filter(
        a => a.id !== activeResolveAlert.id
      )
    );

    setActiveResolveAlert(null);
    setReportText('');
    setResolveError('');

  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="content">
      
      {/* Header Area */}
  <div style={{ marginBottom: '32px' }}>
  <div
    style={{
      background: 'var(--surface)',
      borderRadius: '24px',
      border: '1px solid var(--border)',
      padding: '20px'
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}
    >
      <h3
        style={{
          fontSize: '1rem',
          fontWeight: 700,
          fontFamily: 'Syne'
        }}
      >
        Live Incident Tracking
      </h3>

      <span
        style={{
          fontSize: '0.75rem',
          color: 'var(--muted)'
        }}
      >
        Satellite Hybrid Mode Active
      </span>
    </div>
  <EmergencyMap
  incidents={mapIncidents}
  height="360px"
  />
  </div>
  </div>

      {/* Priority Log */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {alerts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)' }}>
             <span style={{ fontSize: '3rem' }}>✅</span>
             <h4 style={{ marginTop: '12px', fontWeight: 800 }}>No Active Emergencies</h4>
             <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>All systems within normal parameters.</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div 
              key={alert.id} 
              style={{ 
                background: alert.severity === 'Critical' ? 'linear-gradient(90deg, rgba(239,68,68,0.1), rgba(0,0,0,0))' : 'var(--surface)',
                border: alert.severity === 'Critical' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border)',
                borderRadius: '20px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                animation: 'slideUp 0.4s ease forwards', cursor: 'pointer'
              }}
              onClick={() => setSelectedIncident(alert)}
            >
              <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div
  style={{
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    background: 'var(--surface2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    border: alert.severity === 'Critical'
      ? '1px solid rgba(239, 68, 68, 0.3)'
      : '1px solid transparent',
    animation: alert.severity === 'Critical'
      ? 'pulse-box 2s infinite'
      : 'none'
  }}
>
  {(alert.type || '').includes('Panic')
    ? '🆘'
    : (alert.type || '').includes('Accident')
    ? '💥'
    : '⚙️'}
</div>
                <div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                      <h4 style={{ fontWeight: 800 }}>{alert.severity === 'Critical' ? 'CRITICAL: ' : ''}{alert.type}</h4>
                      <span style={{ fontSize: '0.6rem', padding: '2px 8px', borderRadius: '4px', background: alert.severity === 'Critical' ? '#ef4444' : 'var(--warn)', color: '#fff' }}>{alert.severity}</span>
                   </div>
                   <div style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'flex', gap: '16px' }}>
                      <span>🚐 <strong>{alert.vehicleId}</strong></span>
                      <span>📍 {alert.location}</span>
                   </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                 <button 
                  onClick={(e) => { e.stopPropagation(); setActiveDispatchAlert(alert); }}
                  style={{ padding: '10px 18px', borderRadius: '10px', background: 'var(--accent)', color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem' }}
                 >
                  {alert.severity === 'Critical' ? 'Initiate Emergency Protocol' : 'Dispatch Help'}
                 </button>
                 
                 <div style={{ position: 'relative' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveContactAlert(activeContactAlert === alert.id ? null : alert.id); }}
                      style={{ padding: '10px 18px', borderRadius: '10px', background: 'var(--surface2)', color: '#fff', border: '1px solid var(--border)', fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem' }}
                    >Contact ▼</button>
                    {activeContactAlert === alert.id && (
                      <div style={{ position: 'absolute', top: '45px', right: 0, width: '180px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', zIndex: 100, overflow: 'hidden' }}>
                        {['Call Driver', 'Send Message', 'Priority Line (Bypass)'].map(o => (
                          <div key={o} className="menu-opt" style={{ padding: '12px 16px', fontSize: '0.75rem', cursor: 'pointer' }}>{o}</div>
                        ))}
                      </div>
                    )}
                 </div>

                 <button 
                  onClick={(e) => { e.stopPropagation(); setActiveResolveAlert(alert); }}
                  style={{ padding: '10px 18px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--muted)', border: '1px solid var(--border)', fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem' }}
                 >Resolve</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Dispatch Modal */}
      {activeDispatchAlert && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', width: '480px', animation: 'scaleIn 0.3s ease' }}>
            <h3 style={{ fontFamily: 'Syne', fontWeight: 800, marginBottom: '8px' }}>Dispatch Response Team</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '24px' }}>Target: {activeDispatchAlert.vehicleId} at {activeDispatchAlert.location}</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
               {DISPATCH_OPTIONS.filter(o => activeDispatchAlert.severity === 'Critical' ? true : o.type === 'Backup').map(opt => (
                 <div key={opt.id} className="dispatch-row" style={{ padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', background: 'var(--surface2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '1.2rem' }}>{opt.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800 }}>{opt.name}</div>
                        <div style={{ fontSize: '0.7rem', color: opt.type === 'Emergency' ? '#ef4444' : 'var(--accent)' }}>{opt.type.toUpperCase()} UNIT</div>
                      </div>
                    </div>
                    <input type="radio" name="d-target" style={{ width: '18px', height: '18px' }} />
                 </div>
               ))}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setActiveDispatchAlert(null)} style={{ flex: 1, padding: '12px', background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => setActiveDispatchAlert(null)} style={{ flex: 2, padding: '12px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}>Dispatch Unit Now</button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {activeResolveAlert && (
         <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
         <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', padding: '32px', width: '450px' }}>
           <h3 style={{ fontFamily: 'Syne', fontWeight: 800, marginBottom: '8px' }}>Mandatory Incident Report</h3>
           <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginBottom: '24px' }}>Incident Type: {activeResolveAlert.type}. Case #RC-{activeResolveAlert.id}</p>
           
           <textarea 
             value={reportText}
             onChange={(e) => { setReportText(e.target.value); setResolveError(''); }}
             placeholder="Describe the resolution steps taken (min 10 characters)..."
             style={{ width: '100%', height: '120px', background: 'var(--bg)', border: resolveError ? '1px solid #ef4444' : '1px solid var(--border)', borderRadius: '12px', padding: '16px', color: '#fff', outline: 'none', marginBottom: '12px' }}
           />

           {resolveError && (
             <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, marginBottom: '16px', animation: 'shake 0.4s ease' }}>
               {resolveError}
             </div>
           )}

           <div style={{ display: 'flex', gap: '12px' }}>
             <button onClick={() => { setActiveResolveAlert(null); setReportText(''); setResolveError(''); }} style={{ flex: 1, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
             <button onClick={handleResolve} style={{ flex: 2, background: 'var(--accent4)', color: '#0b0f1a', border: 'none', borderRadius: '10px', padding: '12px', fontWeight: 800, cursor: 'pointer' }}>Finalize & Close Case</button>
           </div>
         </div>
       </div>
      )}


      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes pulse-box { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }
        .glow-dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 10px #ef4444; animation: blink 0.5s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        .menu-opt:hover { background: var(--surface2); color: var(--accent); }
        .dispatch-row:hover { border-color: var(--accent) !important; background: rgba(59,130,246,0.05) !important; }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
      `}} />
    </div>
  );
}
