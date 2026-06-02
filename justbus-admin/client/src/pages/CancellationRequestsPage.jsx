import React, { useEffect, useState } from "react";
import {
  getCancellationRequests,
  approveCancellationRequest,
  rejectCancellationRequest
} from "../services/api";

export default function CancellationRequestsPage() {

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {

    try {

      const res =
        await getCancellationRequests();

      setRequests(res.data);

    } catch (err) {

      console.error(err);

    } finally {

      setLoading(false);
    }
  }

  async function approve(id) {

    try {

      await approveCancellationRequest(id);

      alert("Request approved");

      loadRequests();

    } catch (err) {

      console.error(err);

      alert("Failed to approve");
    }
  }

  async function reject(id) {

    try {

      await rejectCancellationRequest(id);

      alert("Request rejected");

      loadRequests();

    } catch (err) {

      console.error(err);

      alert("Failed to reject");
    }
  }

  return (
    <div className="content">

      <div className="panel">

        <div className="panel-header">
          <div className="panel-title">
            ❌ Cancellation Requests
          </div>
        </div>

        {loading ? (

          <div style={{
            padding: "20px",
            textAlign: "center"
          }}>
            Loading...
          </div>

        ) : requests.length === 0 ? (

          <div style={{
            padding: "20px",
            textAlign: "center"
          }}>
            No cancellation requests
          </div>

        ) : (

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Email</th>
                <th>Route</th>
                <th>Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {requests.map(r => (

                <tr key={r.id}>

                  <td>{r.id}</td>

                  <td>{r.name}</td>

                  <td>{r.email}</td>

                  <td>
                    {r.from_city}
                    {" → "}
                    {r.to_city}
                  </td>

                  <td>
                    {new Date(
                      r.trip_date
                    ).toLocaleDateString()}
                  </td>

                  <td
                    style={{
                      maxWidth: "250px"
                    }}
                  >
                    {r.reason}
                  </td>

                  <td>

                    <span
                      style={{
                        color:
                          r.status === "approved"
                            ? "#22c55e"
                            : r.status === "rejected"
                            ? "#ef4444"
                            : "#f59e0b",
                        fontWeight: 600
                      }}
                    >
                      {r.status}
                    </span>

                  </td>

                  <td>

                    {r.status === "pending" && (

                      <div
                        style={{
                          display: "flex",
                          gap: "8px"
                        }}
                      >

                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            approve(r.id)
                          }
                        >
                          Approve
                        </button>

                        <button
                          className="btn btn-ghost"
                          onClick={() =>
                            reject(r.id)
                          }
                        >
                          Reject
                        </button>

                      </div>

                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}