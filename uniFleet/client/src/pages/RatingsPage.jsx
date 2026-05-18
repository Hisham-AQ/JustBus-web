
import React, { useState, useEffect } from 'react';
import { getRatingsAnalytics, getRatingComments, getDriverRatings, getDriverReviews } from '../services/api';


export default function RatingsPage() {
  const [analytics,
  setAnalytics] =
  useState(null);

const [comments,
  setComments] =
  useState([]);

  const [selectedDriver,
  setSelectedDriver] =
  useState(null);

const [driverReviews,
  setDriverReviews] =
  useState([]);

const [showDriverModal,
  setShowDriverModal] =
  useState(false);


  const [drivers,
  setDrivers] =
  useState([]);

const [loading,
  setLoading] =
  useState(true);
  
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {

async function loadData() {

  try {

    const analyticsRes =
      await getRatingsAnalytics();

    setAnalytics(
      analyticsRes.data
    );

    const driversRes =
  await getDriverRatings();

setDrivers(
  driversRes.data
);

    setComments(
      analyticsRes.data
        .recentComments || []
    );

  } catch (err) {

    console.error(err);

  } finally {

    setLoading(false);
  }
}
  loadData();

}, []);


async function openDriverReviews(
  driver
) {

  try {

    const res =
      await getDriverReviews(
        driver.id
      );

    setSelectedDriver(driver);

    setDriverReviews(
      res.data
    );

    setShowDriverModal(true);

  } catch (err) {

    console.error(err);
  }
}


if (loading) {

  return (
    <div className="content">
      Loading ratings...
    </div>
  );
}
  return (
    <div className="content">
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', background: 'var(--accent4)', color: '#0b0f1a',
          padding: '12px 24px', borderRadius: '12px', fontWeight: 700, zIndex: 1000,
          boxShadow: '0 8px 30px rgba(16, 185, 129, 0.3)', animation: 'slideInRight 0.3s'
        }}>
          ✅ {toastMessage}
        </div>
      )}

      {/* --- HEADER --- */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.8rem', marginBottom: '4px', background: 'linear-gradient(to right, #3b82f6, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Rating Analytics
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Student feedback and transport service analytics</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
        </div>
      </div>

{/* Analytics Cards */}

<div style={{
  display: 'grid',
  gridTemplateColumns:
  'repeat(auto-fit, minmax(220px, 1fr))',
  gap: '18px',
  marginBottom: '28px'
}}>

  <div style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '24px'
  }}>

    <div style={{
      fontSize: '.8rem',
      color: 'var(--muted)',
      marginBottom: '10px'
    }}>
      ⭐ Driver Rating
    </div>

    <div style={{
      fontSize: '2rem',
      fontWeight: 800,
      color: '#fbbf24'
    }}>
      {analytics?.averages?.avgDriver}
    </div>

  </div>

  <div style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '24px'
  }}>

    <div style={{
      fontSize: '.8rem',
      color: 'var(--muted)',
      marginBottom: '10px'
    }}>
      🚌 Trip Rating
    </div>

    <div style={{
      fontSize: '2rem',
      fontWeight: 800,
      color: '#3b82f6'
    }}>
      {analytics?.averages?.avgTrip}
    </div>

  </div>

  <div style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '24px'
  }}>

    <div style={{
      fontSize: '.8rem',
      color: 'var(--muted)',
      marginBottom: '10px'
    }}>
      🛠 Service Rating
    </div>

    <div style={{
      fontSize: '2rem',
      fontWeight: 800,
      color: '#10b981'
    }}>
      {analytics?.averages?.avgService}
    </div>

  </div>

  <div style={{
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '24px'
  }}>

    <div style={{
      fontSize: '.8rem',
      color: 'var(--muted)',
      marginBottom: '10px'
    }}>
      📝 Total Reviews
    </div>

    <div style={{
      fontSize: '2rem',
      fontWeight: 800,
      color: '#8b5cf6'
    }}>
      {analytics?.averages?.totalRatings}
    </div>

  </div>

</div>

{/*Driver section */}

<div style={{
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '24px',
  padding: '28px',
  marginBottom: '28px'
}}>

  <h2 style={{
    marginBottom: '20px',
    fontFamily: 'Syne, sans-serif'
  }}>
    Driver Performance
  </h2>

  <div style={{
    display: 'grid',
    gap: '16px'
  }}>

    {drivers.map(driver => (

      <div
        key={driver.id}
        onClick={() =>
  openDriverReviews(driver)
}
        style={{
          cursor: 'pointer',
transition: '.2s',
          background: 'var(--surface2)',
          border:
            '1px solid rgba(255,255,255,.05)',
          borderRadius: '18px',
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >

        <div>

          <div style={{
            fontWeight: 700,
            fontSize: '1rem',
            marginBottom: '6px'
          }}>
            {driver.name}
          </div>

          <div style={{
            color: 'var(--muted)',
            fontSize: '.8rem'
          }}>
            {driver.totalReviews} reviews
          </div>

        </div>

        <div style={{
          display: 'flex',
          gap: '18px',
          fontSize: '.82rem'
        }}>

          <div>
            ⭐ Driver:
            {driver.avgDriverRating}
          </div>

          <div>
            🚌 Trip:
            {driver.avgTripRating}
          </div>

          <div>
            🛠 Service:
            {driver.avgServiceRating}
          </div>

        </div>

      </div>

    ))}

  </div>

</div>

{/* Comments */}

<div style={{
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: '24px',
  padding: '28px'
}}>

  <h2 style={{
    marginBottom: '24px',
    fontFamily: 'Syne, sans-serif'
  }}>
    Latest Student Feedback
  </h2>

  <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }}>

    {comments.length === 0 ? (

      <div style={{
        color: 'var(--muted)'
      }}>
        No comments found
      </div>

    ) : (

      comments.map(comment => (

        <div
          key={comment.id}
          style={{
            background: 'var(--surface2)',
            border:
              '1px solid rgba(255,255,255,.05)',
            borderRadius: '18px',
            padding: '18px'
          }}
        >

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '10px'
          }}>

            <div>

              <div style={{
                fontWeight: 700,
                marginBottom: '4px'
              }}>
                {comment.userName}
              </div>

              <div style={{
                fontSize: '.72rem',
                color: 'var(--muted)'
              }}>
                {
                  new Date(
                    comment.created_at
                  ).toLocaleString()
                }
              </div>

            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              fontSize: '.78rem'
            }}>

              <span>
                ⭐ Driver:
{'⭐'.repeat(comment.driver_rating)}
              </span>

              <span>
                🚌 Trip:
                {comment.trip_rating}
              </span>

              <span>
                🛠 Service:
                {comment.service_rating}
              </span>

            </div>

          </div>

          <div style={{
            fontSize: '.9rem',
            lineHeight: 1.5,
            color: 'var(--text)'
          }}>
            "{comment.comment}"
          </div>

        </div>

      ))
      
    )}
{showDriverModal && (

  <div style={{
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  }}>

    <div style={{
      width: '90%',
      maxWidth: '900px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '24px',
      padding: '28px',
      maxHeight: '85vh',
      overflowY: 'auto'
    }}>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>

        <h2 style={{
          fontFamily: 'Syne, sans-serif'
        }}>
          ⭐ {selectedDriver?.name} Reviews
        </h2>

        <button
          onClick={() =>
            setShowDriverModal(false)
          }
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '1.4rem',
            cursor: 'pointer'
          }}
        >
          ✕
        </button>

      </div>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>

        {driverReviews.length === 0 ? (

          <div>
            No reviews found
          </div>

        ) : (

          driverReviews.map(review => (

            <div
              key={review.id}
              style={{
                background: 'var(--surface2)',
                border:
                  '1px solid rgba(255,255,255,.05)',
                borderRadius: '16px',
                padding: '18px'
              }}
            >

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}>

                <div>

                  <div style={{
                    fontWeight: 700
                  }}>
                    {review.userName}
                  </div>

                  <div style={{
                    color: 'var(--muted)',
                    fontSize: '.72rem'
                  }}>
                    {
                      new Date(
                        review.created_at
                      ).toLocaleString()
                    }
                  </div>

                </div>

                <div style={{
                  fontSize: '.8rem',
                  display: 'flex',
                  gap: '12px'
                }}>

                  <span>
                    ⭐{'⭐'.repeat(
                      review.driver_rating
                    )}
                  </span>

                  <span>
                    🚌{'⭐'.repeat(
                      review.trip_rating
                    )}
                  </span>

                  <span>
                    🛠{'⭐'.repeat(
                      review.service_rating
                    )}
                  </span>

                </div>

              </div>

              <div>
                "{review.comment}"
              </div>

            </div>

          ))

        )}

      </div>

    </div>

      </div>

)}
  </div>

</div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
      `}} />
    </div>
  );
}
