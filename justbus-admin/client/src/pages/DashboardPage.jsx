import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import StatCard from '../components/StatCard';
import LiveMap from '../components/LiveMap';
import Pill from '../components/Pill';
import { getDashboardStats, getDriverRatings,getDriverActivity, getWeeklyTrips } from '../services/api';
import { useSocket } from '../hooks/useSocket';


export default function DashboardPage() {
  const [stats, setStats] = useState({
  activeBuses: 0,
  activeRoutes: 0,
  studentsOnBoard: 0,
  pendingParcels: 0
});

  const [driverActivity,
setDriverActivity] =
useState([]);
  const [busPositions, setBusPositions] = useState([]);
  const navigate = useNavigate();
  const [driverRatings,
setDriverRatings] =
useState([]);

const [weeklyTripsData,
setWeeklyTripsData] =
useState([]);

  useEffect(() => {
    getWeeklyTrips()
  .then(r =>
    setWeeklyTripsData(r.data)
  )
  .catch(() => {});

    getDriverActivity()
  .then(r =>
    setDriverActivity(r.data)
  )
  .catch(() => {});

    getDriverRatings()
  .then(r => {

    const formatted =
      r.data.map(driver => ({

        name: driver.name,

        rating:
          Number(
            driver.avgDriverRating
          )
      }));

    setDriverRatings(
      formatted
    );

  })
  .catch(() => {});

    getDashboardStats().then(r => setStats(prev => ({...prev, ...r.data}))).catch(() => {});
  }, []);

  useSocket({
  onBusLocation: (data) => {
    setBusPositions(prev => {
      const idx = prev.findIndex(
        b => b.busId === data.busId
      );

      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = data;
        return updated;
      }

      return [...prev, data];
    });
  }
});

  const location = useLocation();
  const searchQuery = new URLSearchParams(location.search).get('q') || '';
  const q = searchQuery.toLowerCase();

const filteredDrivers =
  driverActivity.filter(d =>

    !q ||

    d.name
      ?.toLowerCase()
      .includes(q) ||

    d.plate_number
      ?.toLowerCase()
      .includes(q)
  );


  return (
    <div className="content">

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
  icon="🚌"
  label="ACTIVE BUSES"
  value={stats.activeBuses}
  trend="Live fleet status"
/>

<StatCard
  icon="⤷"
  label="ACTIVE ROUTES"
  value={stats.activeRoutes}
  trend="All systems normal"
/>

<StatCard
  icon="👥"
  label="STUDENTS ON BOARD"
  value={stats.studentsOnBoard}
  trend="Registered students"
/>

<StatCard
  icon="📦"
  label="PENDING PARCELS"
  value={stats.pendingParcels}
  trend="Awaiting processing"
/>
      </div>

      {/* Map + Alerts */}
      <div style={{ marginBottom: '24px'}}>
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">🗺 Live Bus Locations</div>
            <button className="panel-action" onClick={() => navigate('/map')}>Full Map →</button>
          </div>
          <LiveMap buses={busPositions} height="300px" />
        </div>
      </div>

      {/* Charts row */}
      <div className="dashboard-grid-2">
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">📈 Weekly Trips</div>
          </div>
          <div style={{ height: '220px', width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyTripsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                <RechartsTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: 'var(--surface2)', border: 'none', borderRadius: '8px', color: 'var(--text)' }} />
                <Bar dataKey="trips" fill="var(--accent)" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div className="panel-title" style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '1rem' }}>⭐ DRIVER RATING</div>
          </div>
          <div style={{ height: '220px', width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={driverRatings} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} dy={10} />
                <YAxis domain={[3.5, 5.0]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--muted)' }} />
                <RechartsTooltip contentStyle={{ background: 'var(--surface2)', border: 'none', borderRadius: '8px', color: 'var(--text)' }} />
                <Line type="monotone" dataKey="rating" stroke="var(--accent2)" strokeWidth={3} dot={{ r: 4, fill: 'var(--accent2)', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Driver Table */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">👤 Recent Driver Activity</div>
          <button className="panel-action" onClick={() => navigate('/drivers')}>Manage →</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>DRIVER</th>
              <th>BUS</th>
              <th>ROUTE</th>
              <th>STATUS</th>
              <th>RATING</th>
              <th>TRIPS TODAY</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: '20px' }}>No driver data found</td></tr>
            )}
            {filteredDrivers.map((d, i) => {
              const colors = ['var(--accent)', 'var(--accent4)', 'var(--accent2)', 'var(--warn)', 'var(--accent3)'];
              const bgs = ['rgba(59,130,246,.15)', 'rgba(16,185,129,.12)', 'rgba(129,140,248,.12)', 'rgba(245,158,11,.12)', 'rgba(239,68,68,.12)'];
              const initials =
  d.name
    ?.split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();



              return (
                <tr key={d.id}>
                  <td>
                    <div className="driver-cell">
                      <div className="mini-avatar" style={{ background: bgs[i%5], color: colors[i%5] }}>{initials}</div>
                      {d.name}
                    </div>
                  </td>
                  <td style={{ fontWeight: 500 }}>{d.plate_number || 'No Bus'}</td>
                  <td style={{ color: 'var(--muted)' }}>Main Route</td>
                  <td><Pill status={d.status} /></td>
                  <td style={{ color: 'var(--text)', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--warn)', marginRight: '6px', letterSpacing: '2px' }}>★★★★★</span>
                    {d.rating || 0}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{d.tripsToday}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
