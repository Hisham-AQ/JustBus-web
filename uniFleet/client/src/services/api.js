import axios from 'axios';


const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
export const getDriverActivity  = () => api.get('/drivers/activity');
export const getWeeklyTrips     = () => api.get('/dashboard/weekly-trips');

// live map
export const getLiveBuses = () => api.get('/admin/map/live-buses');

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
export const updateStudentBalance = (id, amount) =>api.put(`/admin/wallet/students/${id}/balance`, { amount });

// ================= TRIP BOOKINGS =================
export const getTripBookings = () => api.get('/admin/trip-bookings');
export const getTripPassengers = (id) => api.get(`/admin/trip-bookings/${id}/passengers`);


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
export const getParcelNotifications = () => api.get('/admin/parcels/notifications/count');

//lost item
export const getAllLostItems = () => api.get("/admin/lost-items");
export const updateLostItemStatus = (id, status) => api.put(`/admin/lost-items/${id}`, {status});

// Ratings
export const getRatingsAnalytics = () => api.get('/admin/ratings/analytics');
export const getRatingComments   = () => api.get('/admin/ratings/comments');
export const getDriverRatings    = () => api.get('/admin/ratings/drivers');
export const getDriverReviews    = (id) => api.get(`/admin/ratings/drivers/${id}/reviews`);

// Alerts
export const getAlerts = () => api.get('/admin/panic');
export const resolveAlert = (id) => api.put(`/admin/panic/${id}/resolve`);
export const getResolvedAlerts = () => api.get('/admin/panic/history');

// Rewards
export const getRewards = () => api.get('/admin/rewards');
export const getRewardRules = () => api.get('/admin/rewards/rules');
export const updateRewardRules = (data) => api.put('/admin/rewards/rules', data);
export const createReward = (data) => api.post('/admin/rewards', data);
export const updateReward = (id, data) => api.put(`/admin/rewards/${id}`, data);
export const deleteReward = (id) => api.delete(`/admin/rewards/${id}`);

//notifications
export const sendGlobalNotification = (data) => api.post("/admin/notifications/global", data);
export const sendUserNotification = (data) => api.post("/admin/notifications/user", data);
export const getAllNotifications = () => api.get("/admin/notifications");
export const deleteNotification = (id) => api.delete(`/admin/notifications/${id}`);

// Admin points
export const addPoints = (data) => api.post('/admin/points/add', data);
export const removePoints = (data) => api.post('/admin/points/remove', data);
export const getPointsHistory = (id) => api.get(`/admin/points/history/${id}`);

// cancel reservation
export const getCancellationRequests = () => api.get("/admin/cancellation-requests");
export const approveCancellationRequest = (id) => api.put(`/admin/cancellation-requests/${id}/approve`);
export const rejectCancellationRequest = (id) => api.put(`/admin/cancellation-requests/${id}/reject`);



// Auth
export const login = (email, password) => api.post('/auth/admin/login', { email, password });
export default api;
