
import React, { useState, useEffect } from 'react';
import {
  getParcels,
  updateParcelStatus,
  deleteParcel,
  verifyParcelDelivery
} from '../services/api';

const STATUSES = [

  {
    id: 'pending',
    label: '📁 Pending',
    color: 'var(--muted)',
    next: 'approved',
    nextLabel: 'Approve'
  },

  {
    id: 'approved',
    label: '✅ Approved',
    color: 'var(--accent)',
    next: 'in_transit',
    nextLabel: 'Dispatch'
  },

  {
    id: 'in_transit',
    label: '🚚 In Transit',
    color: 'var(--accent4)',
    next: 'delivered',
    nextLabel: 'Deliver'
  },

  {
    id: 'delivered',
    label: '📦 Delivered',
    color: 'lime'
  },

  {
    id: 'cancelled',
    label: '❌ Cancelled',
    color: 'var(--accent3)'
  }
];

export default function ParcelsPage() {
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [verifyParcel, setVerifyParcel] = useState(null);
  const [deliveryCode, setDeliveryCode] = useState('');

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const pRes = await getParcels();
    setParcels(pRes.data);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }



  async function moveStatus(parcelId, newStatus) {
    try {
      await updateParcelStatus(parcelId, newStatus);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to permanently delete this parcel?')) return;
    try {
      await deleteParcel(id);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = parcels.filter(p =>
  p.order_number?.toLowerCase().includes(search.toLowerCase()) ||

  p.receiver_name?.toLowerCase().includes(search.toLowerCase()) ||

  p.pickup_location?.toLowerCase().includes(search.toLowerCase()) ||

  p.dropoff_location?.toLowerCase().includes(search.toLowerCase())
);

  return (
    <div className="content">
      <div className="toolbar" style={{ marginBottom: '32px', alignItems: 'center', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <input 
            placeholder="Search by order number, receiver, pickup or destination..."
            className="search-input"
            style={{ 
              width: '100%',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '12px', padding: '12px 16px 12px 42px', color: 'var(--text)',
              outline: 'none', fontSize: '0.9rem', transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px', color: 'var(--muted)', fontSize: '1rem', fontStyle: 'italic' }}>⏳ Loading parcel console...</div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '24px',
          alignItems: 'start'
        }}>
          {STATUSES.map(status => (
            <div key={status.id} style={{
              background: 'rgba(15, 23, 42, 0.3)',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              padding: '20px',
              minHeight: '600px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Syne, sans-serif' }}>{status.label}</h4>
                <span style={{ 
                  background: 'var(--surface2)', padding: '4px 12px', borderRadius: '10px', 
                  fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 700 
                }}>
                  {filtered.filter(p => p.status === status.id).length}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {filtered.filter(p => p.status === status.id).map(parcel => (
                  <div key={parcel.id} style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                    position: 'relative',
                    transition: 'transform 0.2s, border-color 0.2s',
                    cursor: 'default'
                  }} className="parcel-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
                      <span style={{ 
                        color: 'var(--accent)', fontWeight: 800, fontSize: '0.9rem', 
                        fontFamily: 'Syne, sans-serif', background: 'rgba(59,130,246,0.1)',
                        padding: '4px 8px', borderRadius: '6px'
                      }}>
                        {parcel.order_number}
                      </span>
                      <button onClick={() => handleDelete(parcel.id)} style={{ 
                        background: 'none', border: 'none', color: 'var(--muted)', 
                        cursor: 'pointer', fontSize: '1.2rem', padding: '4px',
                        transition: 'color 0.2s'
                      }} onMouseEnter={e => e.target.style.color = 'var(--accent3)'} onMouseLeave={e => e.target.style.color = 'var(--muted)'}>🗑</button>
                    </div>
                    
                    <div
  style={{
    fontSize: '0.95rem',
    marginBottom: '16px',
    lineHeight: 1.7,
    color: 'var(--text)'
  }}
>

  <div>
    <strong>Sender:</strong> {parcel.userName}
  </div>

  <div>
    <strong>Receiver:</strong> {parcel.receiver_name}
  </div>

  <div>
    <strong>From:</strong> {parcel.pickup_location}
  </div>

  <div>
    <strong>To:</strong> {parcel.dropoff_location}
  </div>

</div>
                    <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginBottom: '16px',
                    fontSize: '0.8rem',
                    color: 'var(--muted)'
                    }}>

   <div>
    📦 {parcel.parcel_type}
  </div>

  <div>
    ⚖️ {parcel.weight || 0} KG
  </div>

  <div>
    🚚 {parcel.delivery_type}
  </div>

  <div>
    💰 {parcel.price || 0} JD
  </div>



</div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                      {status.next && (
                        <button 
                          onClick={() => {

  if (status.next === 'delivered') {

    setVerifyParcel(parcel);

  } else {

    moveStatus(
      parcel.id,
      status.next
    );
  }
}}
                          style={{ 
                            flex: 1, fontSize: '0.75rem', padding: '8px 12px', borderRadius: '8px',
                            background: 'var(--accent)', border: 'none',
                            color: '#fff', cursor: 'pointer', fontWeight: 700,
                            transition: 'transform 0.1s'
                          }}
                          onMouseDown={e => e.target.style.transform = 'scale(0.95)'}
                          onMouseUp={e => e.target.style.transform = 'scale(1)'}
                        >
                          {status.nextLabel}
                        </button>
                      )}
                      
                      {status.id !== 'cancelled' && status.id !== 'delivered' && (
                        <button 
                          onClick={() => moveStatus(parcel.id, 'cancelled')}
                          style={{ 
                            fontSize: '0.75rem', padding: '8px 12px', borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: 'var(--accent3)', cursor: 'pointer', fontWeight: 600
                          }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {filtered.filter(p => p.status === status.id).length === 0 && (
  <div style={{
    textAlign: 'center',
    color: 'var(--muted)',
    padding: '40px 20px',
    opacity: 0.6
  }}>
    No parcels
  </div>
)}
              </div>
            </div>
          ))}
          
        </div>
      )}
      {verifyParcel && (

  <div style={{
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>

    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      padding: '24px',
      width: '400px',
      maxWidth: '95vw'
    }}>

      <h3 style={{
        marginBottom: '12px',
        fontFamily: 'Syne, sans-serif'
      }}>
        Verify Delivery
      </h3>

      <p style={{
        color: 'var(--muted)',
        marginBottom: '16px',
        fontSize: '0.9rem'
      }}>
        Enter the parcel PIN code
        to confirm delivery.
      </p>

      <input
        type="text"
        value={deliveryCode}
        onChange={e =>
          setDeliveryCode(e.target.value)
        }
        placeholder="Enter PIN"
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: '10px',
          border: '1px solid var(--border)',
          background: 'var(--surface2)',
          color: 'var(--text)',
          marginBottom: '20px'
        }}
      />

      <div style={{
        display: 'flex',
        gap: '10px'
      }}>

        <button
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--surface2)',
            color: 'var(--text)',
            cursor: 'pointer'
          }}
          onClick={() => {

            setVerifyParcel(null);

            setDeliveryCode('');
          }}
        >
          Cancel
        </button>

        <button
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '10px',
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 700
          }}
          onClick={async () => {

            try {

              await verifyParcelDelivery(
                verifyParcel.id,
                deliveryCode
              );

              setVerifyParcel(null);

              setDeliveryCode('');

              await loadData();

            } catch (err) {

              alert(
                err.response?.data?.message
                || 'Invalid PIN'
              );
            }
          }}
        >
          Confirm Delivery
        </button>

      </div>

    </div>

  </div>
)}
    </div>
  );
}
