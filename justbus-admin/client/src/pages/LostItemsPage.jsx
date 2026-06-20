import React, {
  useEffect,
  useState
} from 'react';

import Pill from '../components/Pill';

import {
  getAllLostItems,
  updateLostItemStatus
} from '../services/api';

export default function LostItemsPage() {

  const [reports, setReports] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  async function loadReports() {

    try {

      const res =
        await getAllLostItems();

      setReports(res.data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  }

  useEffect(() => {

    loadReports();

  }, []);

  async function changeStatus(
    id,
    status
  ) {

    try {

      await updateLostItemStatus(
        id,
        status
      );

      setReports(prev =>
        prev.map(report =>
          report.id === id
            ? {
                ...report,
                status
              }
            : report
        )
      );

    } catch (err) {

      console.error(err);
    }
  }

  return (
    <div className="content">

      {/* HEADER */}
      <div
        className="panel"
        style={{
          marginBottom: '20px'
        }}
      >

        <div className="panel-header">

          <div
            className="panel-title"
          >
            🎒 Lost & Found Reports
          </div>

        </div>

        <div
          style={{
            color: 'var(--muted)',
            fontSize: '0.85rem'
          }}
        >
          Manage lost item reports
          submitted by students.
        </div>

      </div>

      {/* TABLE */}
      <div className="panel">

        <div
          className="panel-header"
        >

          <div
            className="panel-title"
            style={{
              fontSize: '0.9rem'
            }}
          >
            📦 All Reports
          </div>

        </div>

        {loading ? (

          <div
            style={{
              padding: '30px',
              textAlign: 'center',
              color: 'var(--muted)'
            }}
          >
            Loading reports...
          </div>

        ) : reports.length === 0 ? (

          <div
            style={{
              padding: '30px',
              textAlign: 'center',
              color: 'var(--muted)'
            }}
          >
            No lost item reports found.
          </div>

        ) : (

          <div
            style={{
              overflowX: 'auto'
            }}
          >

            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Item</th>
                  <th>Category</th>
                  <th>User</th>
                  <th>Lost Date</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {reports.map(report => (

                  <tr key={report.id}>

                    <td>
                      #{report.id}
                    </td>

                    <td
                      style={{
                        fontWeight: 600,
                        color:
                          'var(--accent)'
                      }}
                    >
                      {report.item_name}
                    </td>

                    <td>
                      {report.category}
                    </td>

                    <td>
                      {report.user_name ||
                        'Unknown'}
                    </td>

                    <td>
                      {new Date(report.lost_date).toLocaleDateString()}
                    </td>

                    <td
                      style={{
                        maxWidth: '250px',
                        color:
                          'var(--muted)',
                        fontSize:
                          '0.82rem'
                      }}
                    >
                      {report.description}
                    </td>

                    <td>

                      <Pill
                        status={
                          report.status
                        }
                      />

                    </td>

                    <td>

                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          flexWrap: 'wrap'
                        }}
                      >

                        <button
                          className="btn btn-primary"
                          style={{
                            fontSize:
                              '0.72rem',
                            padding:
                              '6px 10px'
                          }}
                          onClick={() =>
                            changeStatus(
                              report.id,
                              'found'
                            )
                          }
                        >
                          Mark Found
                        </button>

                        <button
                          className="btn btn-ghost"
                          style={{
                            fontSize:
                              '0.72rem',
                            padding:
                              '6px 10px'
                          }}
                          onClick={() =>
                            changeStatus(
                              report.id,
                              'rejected'
                            )
                          }
                        >
                          Reject
                        </button>

                        <button
                          className="btn btn-ghost"
                          style={{
                            fontSize:
                              '0.72rem',
                            padding:
                              '6px 10px'
                          }}
                          onClick={() =>
                            changeStatus(
                              report.id,
                              'pending'
                            )
                          }
                        >
                          Pending
                        </button>

                        <button
  className="btn btn-primary"
  style={{
    fontSize: '0.72rem',
    padding: '6px 10px'
  }}
  onClick={() =>
    changeStatus(
      report.id,
      'claimed'
    )
  }
>
  Claimed
</button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}