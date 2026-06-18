
import React, { useState, useEffect } from 'react';
import Pill from '../components/Pill';
import {
  getTrips,
  createTrip,
  updateTrip,
  deleteTrip,
  getStations,
  getDrivers,
  getBuses
} from '../services/api';

const STATUS_OPTIONS = ['scheduled','ongoing','completed','cancelled'];



const emptyForm = {
  fromCity: '',
  toCity: '',

pickupStations: [],
dropoffStations: [],

  departureTime: '',
  arrivalTime: '',
  durationMinutes: '',

  tripDate: '',
  price: '',
status: 'scheduled',

driverId: '',
};

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '32px', width: '550px', maxWidth: '95vw',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        maxHeight: '90vh',
overflowY: 'auto',
paddingRight: '8px',
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

export default function RoutesPage() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');
  const [stations, setStations] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');




useEffect(() => {
  loadData();
  loadStations();
  loadDrivers();
  loadBuses();
}, []);

async function loadStations() {
  try {
    const res = await getStations();
    setStations(res.data || []);
  } catch (err) {
    console.error("LOAD STATIONS ERROR:", err);
  }
}

async function loadDrivers() {
  try {
    const res = await getDrivers();
    setDrivers(res.data || []);
  } catch (err) {
    console.error("LOAD DRIVERS ERROR:", err);
  }
}

async function loadBuses() {
  try {
    const res = await getBuses();
    setBuses(res.data || []);
  } catch (err) {
    console.error("LOAD BUSES ERROR:", err);
  }
}

 async function loadData() {
  setLoading(true);
  try {
    const res = await getTrips();

    const data = Array.isArray(res.data) ? res.data : [];

    const mapped = data.map(trip => ({
      fromCity: trip.fromCity,
toCity: trip.toCity,

    pickupLocation:
  trip.pickupLocation,

dropoffLocation:
  trip.dropoffLocation,

driverId: trip.driverId,
busId: trip.busId,
driverName: trip.driverName,
busPlate: trip.busPlate,

departureTime: trip.departureTime
  ? trip.departureTime.slice(0, 5)
  : '',

arrivalTime: trip.arrivalTime
  ? trip.arrivalTime.slice(0, 5)
  : '',

tripDate: trip.tripDate
  ? new Date(trip.tripDate)
      .toLocaleDateString('en-CA')
  : '',

price: trip.price,
      id: trip.id,
      name: `${trip.fromCity} → ${trip.toCity}`,
      startStop:
  Array.isArray(trip.pickupLocation)
    ? trip.pickupLocation
        .map(stop =>
          typeof stop === "object"
            ? stop.name
            : stop
        )
        .join(", ")
    : "N/A",

    
durationMinutes: trip.durationMinutes,

endStop:
  Array.isArray(trip.dropoffLocation)
    ? trip.dropoffLocation
        .map(stop =>
          typeof stop === "object"
            ? stop.name
            : stop
        )
        .join(", ")
    : "N/A",

      status: trip.status || "scheduled",
      stops: [],
      busCount: 0
    }));

    setRoutes(mapped);
  } catch (e) {
    console.error(e);
    setRoutes([]);
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

  function openEdit(route) {
  setEditing(route);

  setForm({
    fromCity: route.fromCity || '',
    toCity: route.toCity || '',

    driverId: route.driverId || '',

    arrivalTime: route.arrivalTime || '',
durationMinutes: route.durationMinutes || '',

    status: route.status || 'scheduled',

    pickupStations:
  Array.isArray(route.pickupLocation)
    ? route.pickupLocation.map(s => s.id)
    : [],

dropoffStations:
  Array.isArray(route.dropoffLocation)
    ? route.dropoffLocation.map(s => s.id)
    : [],

    departureTime: route.departureTime || '',
    tripDate: route.tripDate || '',
    price:
  route.price != null
    ? Number(route.price)
    : '',
  });

  setErrors({});
  setShowModal(true);
}

  function validate() {
  const e = {};

  if (!form.arrivalTime)
  e.arrivalTime = 'Arrival time required';

if (!form.durationMinutes)
  e.durationMinutes = 'Trip duration required';

  if (!form.fromCity.trim())
  e.fromCity = 'From city required';

if (!form.toCity.trim())
  e.toCity = 'To city required';

  if (form.pickupStations.length === 0)
    e.startStop = 'Select at least one pickup station';

  if (form.dropoffStations.length === 0)
    e.endStop = 'Select at least one dropoff station';

  if (!form.departureTime)
    e.departureTime = 'Departure time required';

  if (!form.tripDate)
    e.tripDate = 'Trip date required';

  if (!form.price)
    e.price = 'Price required';

  return e;
}

async function handleSave() {
  const errs = validate();

  if (Object.keys(errs).length > 0) {
    setErrors(errs);
    return;
  }

  setSaving(true);

  try {
    const payload = {
      fromCity: form.fromCity,
      toCity: form.toCity,

      driverId: form.driverId || null,

      pickupLocation: form.pickupStations,
      dropoffLocation: form.dropoffStations,

      status: form.status,
      departureTime: form.departureTime,
      arrivalTime: form.arrivalTime,
      durationMinutes: form.durationMinutes,

      price:
        form.price === ''
          ? null
          : Number(form.price),

      availableSeats: 30,
      tripDate: form.tripDate
    };

    if (editing) {
      await updateTrip(editing.id, payload);

      setSuccessMessage(
        'Trip updated successfully!'
      );
    } else {
      await createTrip(payload);

      setSuccessMessage(
        'Trip created successfully!'
      );
    }

    setShowModal(false);
    setForm(emptyForm);

    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);

    await loadData();

  } catch (err) {
    setErrors({
      general:
        err.response?.data?.message ||
        err.message
    });
  } finally {
    setSaving(false);
  }
}

  async function handleDelete(route) {
    try {
      await deleteTrip(route.id);
      setConfirmDelete(null);
      await loadData();
    } catch (err) {
      alert('Cannot delete: ' + (err.response?.data?.message || err.message));
    }
  }

  const filtered = routes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    String(r.id).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="content">
      {/* Toolbar */}
      <div className="toolbar">
        <button className="btn btn-primary" onClick={openAdd}>+ New Trip</button>
        <input
          placeholder="🔍 Search routes by name or ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, width: '300px', marginLeft: 'auto' }}
        />
      </div>


{successMessage && (
  <div
    style={{
      background: 'rgba(16,185,129,.15)',
      border: '1px solid #10b981',
      color: '#10b981',
      padding: '12px',
      borderRadius: '10px',
      marginBottom: '16px',
      fontWeight: 600
    }}
  >
    ✅ {successMessage}
  </div>
)}


      {/* Routes Table */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">⤷ All Trips</div>
          <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>{filtered.length} routes active</span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)' }}>⏳ Loading routes...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Route ID</th>
                <th>Name</th>
                <th>Stops</th>
                <th>Buses</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '30px' }}>
                    No trips found.
                  </td>
                </tr>
              )}
              {filtered.map(route => (
                <tr key={route.id}>
                  <td style={{ color: 'var(--accent)', fontFamily: 'Syne, sans-serif', fontSize: '0.85rem' }}>
                    {route.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{route.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{route.startStop} → {route.endStop}

<br />

<span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
  Driver: {route.driverName || 'Unassigned'}
</span>

<br />

<span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
  Bus: {route.busPlate || 'Unassigned'}
</span>
<br />

<span
  style={{
    fontSize: '0.7rem',
    color: 'var(--accent2)'
  }}
>
  📅 {route.tripDate}
</span>

<br />

<span
  style={{
    fontSize: '0.7rem',
    color: 'var(--accent4)'
  }}
>
  🕒 {route.departureTime}
  → {route.arrivalTime}
</span>
</div>
                  </td>
                  <td>
                    <span style={{
                      background: 'rgba(129,140,248,.12)', color: 'var(--accent2)',
                      padding: '2px 8px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600
                    }}>
                      {route.stops?.length || 0} stops
                    </span>
                  </td>
                  <td>
                    <span style={{ color: 'var(--accent4)', fontWeight: 600 }}>
                      {route._count?.buses || 0} buses
                    </span>
                  </td>
                  <td><Pill status={route.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        onClick={() => openEdit(route)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                        onClick={() => setConfirmDelete(route)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Modal title={editing ? `✏️ Edit Route — ${editing.name}` : '+ Add New Trip'} onClose={() => setShowModal(false)}>
          {errors.general && <div style={{ color: 'var(--accent3)', fontSize: '0.82rem', marginBottom: '10px' }}>⚠️ {errors.general}</div>}



<div style={{
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '14px'
}}>
  <FormField
    label="From City"
    error={errors.fromCity}
  >
    <input
      value={form.fromCity}
      onChange={(e) =>
        setForm({
          ...form,
          fromCity: e.target.value
        })
      }
      placeholder="e.g. Amman"
      className="form-input"
    />
  </FormField>

  <FormField
    label="To City"
    error={errors.toCity}
  >
    <input
      value={form.toCity}
      onChange={(e) =>
        setForm({
          ...form,
          toCity: e.target.value
        })
      }
      placeholder="e.g. JUST University"
      className="form-input"
    />
  </FormField>
</div>

          <FormField label="Departure Time">
  <input
    type="time"
    style={inputStyle}
    value={form.departureTime}
    onChange={e => setForm({ ...form, departureTime: e.target.value })}
  />
</FormField>

<FormField label="Arrival Time">
  <input
    type="time"
    style={inputStyle}
    value={form.arrivalTime}
    onChange={e =>
      setForm({
        ...form,
        arrivalTime: e.target.value
      })
    }
  />
</FormField>

<FormField label="Trip Duration (Minutes)">
  <input
    type="number"
    style={inputStyle}
    value={form.durationMinutes}
    onChange={e =>
      setForm({
        ...form,
        durationMinutes: e.target.value
      })
    }
    placeholder="e.g. 90"
  />
</FormField>

<FormField label="Trip Date">
  <input
    type="date"
    style={inputStyle}
    value={form.tripDate}
    onChange={e => setForm({ ...form, tripDate: e.target.value })}
  />
</FormField>

<FormField label="Price">
  <input
    type="number"
step="0.01"
min="0"
    style={inputStyle}
    value={form.price}
    onChange={e => setForm({ ...form, price: e.target.value })}
  />
</FormField>


          <FormField label="Driver">
  <select
    style={{ ...inputStyle, cursor: 'pointer' }}
    value={form.driverId}
    onChange={e =>
      setForm({
        ...form,
        driverId: e.target.value
      })
    }
  >
    <option value="">Select Driver</option>

    {drivers.map(driver => (
      <option key={driver.id} value={driver.id}>
        {driver.name}
      </option>
    ))}
  </select>
</FormField>


          <FormField label="Status">
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


                <FormField label="Pickup Stations">
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  }}>
    {stations.map(station => (
      <label
        key={station.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem'
        }}
      >
        <input
          type="checkbox"
          checked={form.pickupStations.includes(station.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setForm({
                ...form,
                pickupStations: [
                  ...form.pickupStations,
                  station.id
                ]
              });
            } else {
              setForm({
                ...form,
                pickupStations:
                  form.pickupStations.filter(
                    id => id !== station.id
                  )
              });
            }
          }}
        />
        {station.name}
      </label>
    ))}
  </div>
</FormField>

<FormField label="Dropoff Stations">
  <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px'
  }}>
    {stations.map(station => (
      <label
        key={station.id}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem'
        }}
      >
        <input
          type="checkbox"
          checked={form.dropoffStations.includes(station.id)}
          onChange={(e) => {
            if (e.target.checked) {
              setForm({
                ...form,
                dropoffStations: [
                  ...form.dropoffStations,
                  station.id
                ]
              });
            } else {
              setForm({
                ...form,
                dropoffStations:
                  form.dropoffStations.filter(
                    id => id !== station.id
                  )
              });
            }
          }}
        />
        {station.name}
      </label>
    ))}
  </div>
</FormField>

{/*
          <StopList
            stops={form.stops}
            onChange={(stops) => setForm({ ...form, stops })}
          />
*/}
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? '⏳ Saving...' : editing ? '✅ Update Trips' : '+ Add Trip'}
            </button>
          </div>
        </Modal>
      )}



      {/* Delete Confirmation */}
      {confirmDelete && (
        <Modal title="⚠️ Delete Trip" onClose={() => setConfirmDelete(null)}>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
            Are you sure you want to delete <strong style={{ color: 'var(--text)' }}>{confirmDelete.name}</strong>?
            This will also remove all intermediate stop data.
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
