import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import LoginPage from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';
import { Toaster } from "react-hot-toast";

import DashboardPage   from './pages/DashboardPage';
import LiveMapPage     from './pages/LiveMapPage';
import TripsPage       from "./pages/TripsPage";
import FleetPage       from './pages/FleetPage';
import DriversPage     from './pages/DriversPage';
import SpecialTripsPage from './pages/SpecialTripsPage';
import ParcelsPage     from './pages/ParcelsPage';
import BlacklistPage   from './pages/StudentControlPage';
import RewardsPage     from './pages/RewardsPage';
import RatingsPage     from './pages/RatingsPage';
import EmergencyPage   from './pages/EmergencyPage';
import TripBookingsPage from './pages/TripBookingsPage';
import LostItemsPage    from "./pages/LostItemsPage";
import NotificationsPage from "./pages/NotificationsPage";
import CancellationRequestsPage from "./pages/CancellationRequestsPage";



function ProtectedLayout({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <Sidebar />
      <div className="main">
        <Topbar />
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"     element={<LoginPage />} />
        <Route path="/"          element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
        <Route path="/map"       element={<ProtectedLayout><LiveMapPage /></ProtectedLayout>} />
        <Route path="/trips"     element={<ProtectedLayout><TripsPage /> </ProtectedLayout>}/>
        <Route path="/fleet"     element={<ProtectedLayout><FleetPage /></ProtectedLayout>} />
        <Route path="/drivers"   element={<ProtectedLayout><DriversPage /></ProtectedLayout>} />
        <Route path="/special-trips"element={<ProtectedLayout><SpecialTripsPage /></ProtectedLayout>}/>       
        <Route path="/parcels"   element={<ProtectedLayout><ParcelsPage /></ProtectedLayout>} />
        <Route path="/blacklist" element={<ProtectedLayout><BlacklistPage /></ProtectedLayout>} />
        <Route path="/rewards"   element={<ProtectedLayout><RewardsPage /></ProtectedLayout>} />
        <Route path="/ratings"   element={<ProtectedLayout><RatingsPage /></ProtectedLayout>} />
        <Route path="/emergency" element={<ProtectedLayout><EmergencyPage /></ProtectedLayout>} />
        <Route path="/trip-bookings" element={ <ProtectedLayout><TripBookingsPage /> </ProtectedLayout>} />
        <Route path="/lost-items" element={<ProtectedLayout><LostItemsPage /></ProtectedLayout>} />
        <Route path="/notifications" element={<ProtectedLayout><NotificationsPage /></ProtectedLayout>}/>
        <Route path="/cancellation-requests"  element={<ProtectedLayout><CancellationRequestsPage /></ProtectedLayout>}/>
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
        <Toaster
    position="top-right"
    toastOptions={{
      style: {
        background: "#111827",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.08)"
      }
    }}
  />
    </BrowserRouter>
  );
}
