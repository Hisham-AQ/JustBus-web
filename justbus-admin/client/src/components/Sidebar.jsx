import React, {
  useState,
  useEffect
} from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { getParcelNotifications }
from '../services/api';

const navItems = [
  { section: 'Overview', items: [
    { to: '/', icon: '⬡', label: 'Dashboard' },
    { to: '/map', icon: '🗺', label: 'Live Bus Map' },
  ]},
  { section: 'Fleet & Routes', items: [
  { to: '/trips', icon: '⤷', label: 'Trips & Stop Mgmt' },
  { to: '/fleet', icon: '🚌', label: 'Bus Fleet' },
  { to: '/drivers', icon: '👤', label: 'Driver Management' },
]},

{ section: 'Operations', items: [
  { to: '/special-trips', icon: '📅', label: 'Special Trips' },
  { to: '/parcels', icon: '📦', label: 'Parcel Console' },
  { to: '/lost-items', icon: '🎒', label: 'Lost & Found' },
  { to: '/trip-bookings', icon: '🎫', label: 'Trip Bookings' },
  { to: '/notifications', icon: '🔔', label: 'Notifications' },
]},
  { section: 'Students', items: [
    { to: '/blacklist', icon: '🎓', label: 'Student Control' },
    { to: '/rewards', icon: '⭐', label: 'Rewards Config' },
    { to: "/cancellation-requests", icon: "❌", label: "Cancellation Requests"}
  ]},
  { section: 'Analytics', items: [
    { to: '/ratings', icon: '📊', label: 'Ratings Analytics' },
    { to: '/emergency', icon: '🚨', label: 'Emergency Console', badge: '2' },
  ]},
];

export default function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem('justbus_token');
    navigate('/login');
  }

  const adminRaw = localStorage.getItem('justbus_admin');
  const admin = adminRaw ? JSON.parse(adminRaw) : { name: 'Super Admin', role: 'System Administrator' };
  const initials = admin.name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase() || 'SA';
  const [parcelCount,
  setParcelCount] =
  useState(0);
  useEffect(() => {

  async function loadParcelCount() {

    try {

      const res =
        await getParcelNotifications();

      setParcelCount(
        res.data.total
      );

    } catch (err) {

      console.error(err);
    }
  }

  loadParcelCount();

}, []);

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="brand-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
          <img src="/JustBus_Main_Logo.png" alt="JustBus Logo" style={{ maxWidth: '100%', height: 'auto', maxHeight: '50px' }} />
        </div>
        <span>Admin Control Center</span>
      </div>

      {navItems.map((group) => (
        <div className="nav-section" key={group.section}>
          <span className="nav-label">{group.section}</span>
          {group.items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.to === '/parcels'
  && parcelCount > 0 && (

  <span className="badge">
    {parcelCount}
  </span>

)}

{item.badge
  && item.to !== '/parcels' && (

  <span className="badge">
    {item.badge}
  </span>

)}
            </NavLink>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="admin-profile">
          <div className="avatar">{initials}</div>
          <div className="admin-info">
            <div className="name">{admin.name}</div>
            <div className="role">{admin.role || 'Administrator'}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            marginTop: '12px', width: '100%', background: 'rgba(239,68,68,.1)',
            color: 'var(--accent3)', border: '1px solid rgba(239,68,68,.2)',
            borderRadius: '8px', padding: '7px', fontSize: '0.8rem',
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
