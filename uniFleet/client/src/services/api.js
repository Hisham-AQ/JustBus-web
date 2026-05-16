import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
});


api.interceptors.request.use((config) => {
  const token = localStorage.getItem('unifleet_token');

  console.log("TOKEN USED:", token); // DEBUG

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn("NO TOKEN FOUND");
  }

  return config;
});

// Dashboard
export const getDashboardStats  = () => api.get('/dashboard/stats');

// Buses
export const getBuses           = () => api.get('/buses');
export const createBus          = (data) => api.post('/buses', data);
export const updateBus          = (id, data) => api.put(`/buses/${id}`, data);
export const deleteBus          = (id) => api.delete(`/buses/${id}`);
export const getBusLocations    = () => api.get('/buses/locations');

// Routes
export const getRoutes          = () => api.get('/routes');
export const createRoute        = (data) => api.post('/routes', data);
export const updateRoute        = (id, data) => api.put(`/routes/${id}`, data);
export const deleteRoute        = (id) => api.delete(`/routes/${id}`);

// Drivers
export const getDrivers         = () => api.get('/drivers');
export const createDriver       = (data) => api.post('/drivers', data);
export const updateDriver       = (id, data) => api.put(`/drivers/${id}`, data);
export const deleteDriver       = (id) => api.delete(`/drivers/${id}`);

// Students / Blacklist
export const getStudents        = () => api.get('/students');
export const getLeaderboard     = () => api.get('/students/leaderboard');
export const blacklistStudent   = (id, data) => api.post(`/students/${id}/blacklist`, data);
export const blacklistManualStudent = (data) => api.post('/students/blacklist-manual', data);
export const liftBlacklist      = (id) => api.delete(`/students/${id}/blacklist`);
export const deleteStudent       = (id) => api.delete(`/students/${id}`);


// Trips (use main api instead of API)
export const getTrips = () => api.get('/admin/trips');
export const createTrip = (data) => api.post('/admin/trips', data);
export const updateTrip = (id, data) => api.put(`/admin/trips/${id}`, data);
export const deleteTrip = (id) => api.delete(`/admin/trips/${id}`);

//Special trips
export const getSpecialTrips =
  () => api.get('/admin/special-trips');

export const createSpecialTrip =
  (data) => api.post('/admin/special-trips', data);

export const updateSpecialTrip =
  (id, data) => api.put(`/admin/special-trips/${id}`, data);

export const deleteSpecialTrip =
  (id) => api.delete(`/admin/special-trips/${id}`);


// Stations
export const getStations = () => api.get('/stations');

// Parcels
export const getParcels           = () => api.get('/admin/parcels');
export const createParcel         = (data) => api.post('/admin/parcels', data);
export const updateParcelStatus   = (id, status) => api.patch(`/admin/parcels/${id}/status`, { status });
export const deleteParcel         = (id) => api.delete(`/admin/parcels/${id}`);
export const verifyParcelDelivery = (id, pin_code) => api.patch(`/admin/parcels/${id}/verify-delivery`,{ pin_code });

// Ratings
export const getRatingsAnalytics = () => api.get('/ratings/analytics');
export const getRatingComments   = () => api.get('/ratings/comments');

// Alerts
export const getAlerts          = () => api.get('/alerts');
export const resolveAlert       = (id) => api.patch(`/alerts/${id}/resolve`);

// Rewards
export const getRewardRules     = () => api.get('/rewards/rules');
export const updateRewardRules  = (rules) => api.put('/rewards/rules', { rules });

// Auth
export const login              = (email, password) => api.post('/auth/login', { email, password });

export default api;
