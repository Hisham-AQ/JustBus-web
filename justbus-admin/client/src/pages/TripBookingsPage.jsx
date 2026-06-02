import React, {
  useEffect,
  useState
} from 'react';

import {
  getTripBookings,
  getTripPassengers
} from '../services/api';

export default function TripBookingsPage() {

  const [trips, setTrips] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedTrip, setSelectedTrip] =
    useState(null);

  const [passengers, setPassengers] =
    useState([]);

  async function loadTrips() {

    

    try {
      

      const res =
        await getTripBookings();

      const mapped = res.data.map(trip => ({

  ...trip,

  fromCity:
    trip.from_city,

  toCity:
    trip.to_city,

  tripDate:
  trip.trip_date
    || trip.tripDate,

departureTime:
  trip.departure_time
    || trip.departureTime,

arrivalTime:
  trip.arrival_time
    || trip.arrivalTime

}));

setTrips(mapped);
    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  }

  async function openPassengers(trip) {

    try {

      setSelectedTrip(trip);

      const res =
        await getTripPassengers(
          trip.tripId
        );

      setPassengers(res.data);

    } catch (err) {

      console.error(err);
    }
  }

  useEffect(() => {

    loadTrips();

  }, []);

  if (loading) {

    return (
      <div className="page">
        Loading...
      </div>
    );
  }

  return (

    <div className="page">

<div style={{
  marginBottom: '28px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: '16px'
}}>

  <div>

    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      marginBottom: '8px'
    }}>

      <div style={{
        width: '5px',
        height: '34px',
        borderRadius: '10px',
        background: 'var(--accent)'
      }} />

      <h1 style={{
        margin: 0,
        fontSize: '2.1rem',
        fontWeight: 800,
        letterSpacing: '-1px'
      }}>
        Trip Bookings
      </h1>

    </div>

    <p style={{
      margin: 0,
      color: 'var(--muted)',
      fontSize: '0.95rem',
      paddingLeft: '17px'
    }}>
      Monitor passengers,
      occupancy and boarding activity
    </p>

  </div>

  <div style={{
    padding: '12px 18px',
    borderRadius: '16px',
    background: 'rgba(59,130,246,.08)',
    border: '1px solid rgba(59,130,246,.18)',
    minWidth: '140px'
  }}>

    <div style={{
      fontSize: '0.75rem',
      color: 'var(--muted)',
      marginBottom: '4px'
    }}>
      TOTAL TRIPS
    </div>

    <div style={{
      fontSize: '1.8rem',
      fontWeight: 800,
      lineHeight: 1
    }}>
      {trips.length}
    </div>

  </div>

</div>

      <div className="glass-card">

        <table className="data-table">

          <thead>
            <tr>

              <th>Trip</th>

              <th>Driver</th>

              <th>Bus</th>

              <th>Bookings</th>

              <th>Remaining</th>

              <th>Actions</th>

            </tr>
          </thead>

          <tbody>

            {trips.map(trip => (

              <tr key={trip.tripId}>

               <td>

  <div
    style={{
      fontWeight: 600
    }}
  >
    {trip.fromCity}
→ {trip.toCity}
  </div>

  <div
    style={{
      fontSize: '0.72rem',
      color: 'var(--muted)',
      marginTop: '4px'
    }}
  >
   📅 {
 trip.tripDate
    ? new Date(trip.tripDate)
        .toLocaleDateString()
    : '—'
}
  </div>

  <div
    style={{
      fontSize: '0.72rem',
      color: 'var(--accent2)'
    }}
  >
    🕒 {trip.departureTime?.slice(0,5)}
→ {trip.arrivalTime?.slice(0,5)}
  </div>

</td>

                <td>
                  {trip.driverName || '—'}
                </td>

                <td>
                  {trip.busPlate || '—'}
                </td>

                <td>
                  {trip.totalBookings}
                </td>

                <td>
                  {trip.busCapacity
  ? `${trip.remainingSeats} / ${trip.busCapacity}`
  : '—'}
                </td>

                <td>

                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      openPassengers(trip)
                    }
                  >
                    View Passengers
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* PASSENGERS MODAL */}

      {selectedTrip && (

        <div style={{
          position: 'fixed',
          inset: 0,
          background:
            'rgba(0,0,0,0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999
        }}>

          <div style={{
            width: '900px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            overflowY: 'auto',
            background:
              'var(--surface)',
            border:
              '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px'
          }}>

            <div style={{
              display: 'flex',
              justifyContent:
                'space-between',
              marginBottom: '20px'
            }}>

              <h2>
                Passengers
              </h2>

              <button
                onClick={() => {
                  setSelectedTrip(null);
                  setPassengers([]);
                }}
              >
                ✕
              </button>

            </div>

            <table className="data-table">

              <thead>

                <tr>

                  <th>Name</th>

                  <th>Email</th>

                  <th>Seat</th>

                  <th>Status</th>

                  <th>Boarded</th>

                </tr>

              </thead>

              <tbody>

                {passengers.map(p => (

                  <tr key={p.id}>

                    <td>
                      {p.name}
                    </td>

                    <td>
                      {p.email}
                    </td>

                    <td>
                      {p.seat_number || '—'}
                    </td>

                    <td>
                      {p.status}
                    </td>

                    <td>
                      {p.is_boarded
                        ? 'Yes'
                        : 'No'}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>
  );
}