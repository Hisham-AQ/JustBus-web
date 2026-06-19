
import React, { useState, useEffect } from 'react';
import Pill from '../components/Pill';
import {
  getSpecialTrips,
  createSpecialTrip,
  updateSpecialTrip,
  deleteSpecialTrip,
  getDrivers
} from '../services/api';

const STATUS_OPTIONS = [
  'active',
  'full',
  'completed',
  'cancelled'
];

const emptyForm = {
  title: '',
  description: '',
  departureTime: '',
  returnTime: '',
  price: '',
  status: 'active',
  driverId: '',
  duration: '',
};

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', 
      justifyContent: 'center', padding: '20px', overflowY: 'auto',
    }}>
      <div style={{
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  padding: '32px',
  width: '500px',
  maxWidth: '95vw',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
}}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: '1rem' }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            color: 'var(--muted)', borderRadius: '8px', padding: '4px 10px',
            cursor: 'pointer', fontSize: '1rem',
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, error, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{
        display: 'block', fontSize: '0.72rem', color: 'var(--muted)',
        marginBottom: '6px', letterSpacing: '0.5px', textTransform: 'uppercase',
      }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: '0.7rem', color: 'var(--accent3)', marginTop: '3px', display: 'block' }}>{error}</span>}
    </div>
  );
}

const inputStyle = {
  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: '8px', padding: '9px 12px', color: 'var(--text)',
  fontFamily: 'DM Sans, sans-serif', fontSize: '0.85rem', outline: 'none',
  transition: 'border-color 0.2s',
};

export default function TripsPage() {
  const [trips, setTrips] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {

  setLoading(true);

  try {

    const [tripsRes, driversRes] =
      await Promise.all([
        getSpecialTrips(),
        getDrivers()
      ]);

    setTrips(tripsRes.data);

    setDrivers(driversRes.data);

  } catch (e) {

    console.error(e);

  } finally {

    setLoading(false);
  }
}

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  }

function openEdit(trip) {

  setEditing(trip);

  setForm({
  title: trip.title || '',
  duration: trip.duration || '',
  description: trip.description || '',
  departureTime: trip.departure_time || '',
  returnTime: trip.return_time || '',
  price: trip.price || '',
  status: trip.status || 'active',
  driverId: trip.driver_id || '',
});

  setErrors({});

  setShowModal(true);
}

  function validate() {
    const e = {};
    if (!form.title) e.routeNameString = 'Route is required';
    if (form.price < 0) e.price = 'Price cannot be negative';
    return e;
  }

  async function handleSave() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);
    try {
      const payload = {
  title: form.title,
  description: form.description,
  price: form.price,
  duration: form.duration,
  departure_time: form.departureTime,
  return_time: form.returnTime,
  status: form.status,
  driver_id: form.driverId
};
      if (editing) {
        await updateSpecialTrip(editing.id, payload);
      } else {
        await createSpecialTrip(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      setErrors({ general: 'Failed to save. Please check your data.' });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(trip) {
    try {
      await deleteSpecialTrip(trip.id);;
      setConfirmDelete(null);
      await loadData();
    } catch (err) {
      alert('Cannot delete: ' + (err.response?.data?.message || err.message));
    }
  }

  const exportSchedule = () => {
    if (trips.length === 0) return;
    
    // CSV Header
    const headers = ["TRIP ID", "DATE & TIME", "BUS", "SEATS", "PRICE", "STATUS"];
    const rows = trips.map((trip, idx) => [
      `ST#${idx + 1}`,
      trip.departure_time,
      trip.busPlate || (trip.bus ? trip.bus.plateNumber : 'N/A'),
`${trip.seats_available}/${trip.seats_total}`,
      `${trip.price} JD`,
      trip.status
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `special_trip_schedule_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="content">


      <div className="toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <button className="btn btn-primary" onClick={openAdd} style={{ padding: '10px 20px', borderRadius: '8px' }}>+ Schedule Trip</button>
        <button className="btn btn-ghost" onClick={exportSchedule} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--surface2)', border: '1px solid var(--border)' }}>Export Schedule</button>
      </div>

      <div className="panel">
        <div className="panel-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px', padding: '20px' }}>
          <span role="img" aria-label="calendar" style={{ fontSize: '1.2rem' }}>🗓️</span>
          <div className="panel-title" style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Special Trip Schedule</div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>⏳ Loading trips...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Trip ID</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Date & Time</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Bus</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Seats</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Price</th>
                <th style={{ textAlign: 'left', padding: '12px 20px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ textAlign: 'center', padding: '12px 20px', color: 'var(--muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px' }}>
                    No special trips scheduled.
                  </td>
                </tr>
              )}
              {trips.map((trip, idx) => (
                <tr key={trip.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontSize: '0.85rem', padding: '16px 20px' }}>
                    ST#{idx + 1}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontSize: '0.875rem' }}>
                      {trip.departure_time}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                    {trip.busPlate || (trip.bus ? `Bus #${trip.bus.plateNumber}` : <span style={{ color: 'var(--muted)' }}>Unassigned</span>)}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '0.875rem' }}>
                    {trip.seats_available} / {trip.seats_total}
                  </td>
                  <td style={{ padding: '16px 20px', fontWeight: 600, fontSize: '0.875rem' }}>
                    {trip.price} JD
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <Pill status={trip.status} />
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--surface2)', borderRadius: '6px' }} onClick={() => openEdit(trip)}>Edit</button>
                    <button className="btn btn-danger" style={{ padding: '6px 12px', fontSize: '0.8rem', marginLeft: '8px' }} onClick={() => setConfirmDelete(trip)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? '✏️ Edit Special Trip' : '+ Create Special Trip'} onClose={() => setShowModal(false)}>
          {errors.general && <div style={{ color: 'var(--accent3)', fontSize: '0.82rem', marginBottom: '10px' }}>⚠️ {errors.general}</div>}

        <FormField label="Trip Title">
  <input
    type="text"
    style={inputStyle}
    value={form.title}
    onChange={e =>
      setForm({
        ...form,
        title: e.target.value
      })
    }
  />
</FormField>

<FormField label="Description">
  <textarea
    style={inputStyle}
    value={form.description}
    onChange={e =>
      setForm({
        ...form,
        description: e.target.value
      })
    }
  />
</FormField>



<FormField label="Driver">
  <select
    style={inputStyle}
    value={form.driverId}
    onChange={e =>
      setForm({
        ...form,
        driverId: e.target.value
      })
    }
  >

    <option value="">
      Select Driver
    </option>

    {drivers.map(driver => (

      <option
        key={driver.id}
        value={driver.id}
      >
        {driver.name}
      </option>

    ))}

  </select>

    {form.driverId && (

  <div style={{
    marginBottom: '14px',
    padding: '12px',
    background: 'var(--surface2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '0.82rem',
    color: 'var(--muted)'
  }}>

    Seats will automatically use
    the assigned bus capacity.

  </div>

)}
</FormField>

<FormField label="Departure Time">
  <input
  type="text"
  style={inputStyle}
  value={form.departureTime}
  onChange={e =>
    setForm({
      ...form,
      departureTime: e.target.value
    })
  }
/>
</FormField>

<FormField label="Return Time">
<input
  type="text"
  style={inputStyle}
  value={form.returnTime}
  onChange={e =>
    setForm({
      ...form,
      returnTime: e.target.value
    })
  }
/>
</FormField>

<FormField label="Duration">

  <input
    type="text"
    style={inputStyle}
    value={form.duration}
    onChange={e =>
      setForm({
        ...form,
        duration: e.target.value
      })
    }
  />

</FormField>


          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <FormField label="Ticket Price (JD)" error={errors.price}>
              <input
                type="number"
                step="0.1"
                style={inputStyle}
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value === ''
  ? ''
  : parseFloat(e.target.value) })}
              />
            </FormField>

          </div>

          <FormField label="Booking Status">
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </FormField>

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '⏳ Saving...' : editing ? '✅ Update Trip' : '+ Create Trip'}
            </button>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal title="⚠️ Delete Trip" onClose={() => setConfirmDelete(null)}>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Are you sure you want to delete this trip? This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setConfirmDelete(null)}>Cancel</button>
            <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleDelete(confirmDelete)}>🗑 Delete</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
