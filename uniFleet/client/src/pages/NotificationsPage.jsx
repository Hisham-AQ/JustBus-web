import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

import { sendGlobalNotification, sendUserNotification, getAllNotifications, deleteNotification} from "../services/api";

export default function NotificationsPage() {

  // ================= GLOBAL =================
  const [globalData, setGlobalData] =
    useState({
      title: "",
      message: "",
      type: "general"
    });

  // ================= USER =================
  const [userData, setUserData] =
    useState({
      user_id: "",
      title: "",
      message: "",
      type: "general"
    });

  const [loading, setLoading] =
    useState(false);

    const [notifications,
setNotifications] =
  useState([]);

  const [search,
setSearch] =
  useState("");

  const filteredNotifications =
  notifications.filter((n) => {

    const searchText =
      search.toLowerCase();

    return (
      n.title
        .toLowerCase()
        .includes(searchText)

      ||

      n.message
        .toLowerCase()
        .includes(searchText)

      ||

      n.type
        .toLowerCase()
        .includes(searchText)
    );
  });

  const totalNotifications =
  notifications.length;

const globalNotifications =
  notifications.filter(
    n => n.is_global === 1
  ).length;

const userNotifications =
  notifications.filter(
    n => n.is_global !== 1
  ).length;

const emergencyNotifications =
  notifications.filter(
    n => n.type === "emergency"
  ).length;

  useEffect(() => {

  loadNotifications();

}, []);

  async function loadNotifications() {

  try {

    const res =
      await getAllNotifications();

    setNotifications(
      res.data
    );

  } catch (err) {

    console.error(err);
  }
}


  // ================= GLOBAL SEND =================
  async function handleGlobalSubmit(e) {

    e.preventDefault();

    try {

      setLoading(true);

      await sendGlobalNotification(
        globalData
      );

      toast.success(
  "Global notification sent"
);

      loadNotifications();

      setGlobalData({
        title: "",
        message: "",
        type: "general"
      });

    } catch (err) {

      console.error(err);

      toast.error(
  "Failed to send notification"
);

    } finally {

      setLoading(false);
    }
  }

  // ================= USER SEND =================
  async function handleUserSubmit(e) {

    e.preventDefault();

    try {

      setLoading(true);

      await sendUserNotification(
        userData
      );

      toast.success(
  "User notification sent"
);

      loadNotifications();

      setUserData({
        user_id: "",
        title: "",
        message: "",
        type: "general"
      });

    } catch (err) {

      console.error(err);

      toast.error(
  "Failed to send notification"
);

    } finally {

      setLoading(false);
    }
  }

  //delete handler
  async function handleDelete(id) {

  const confirmed =
    window.confirm(
      "Delete this notification?"
    );

  if (!confirmed) return;

  try {

    await deleteNotification(id);

    setNotifications(prev =>
      prev.filter(
        n => n.id !== id
      )
    );

  } catch (err) {

    console.error(err);
  }
}

const inputStyle = {
  background: "#1a1f2b",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  padding: "14px",
  color: "white",
  fontSize: "0.95rem",
  outline: "none",
  width: "100%",
  fontFamily: "inherit",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none"
};

  return (

    <div className="content">

      {/* HEADER */}
      <div
        className="panel"
        style={{
          marginBottom: "20px",
          padding: "24px"
        }}
      >

        <div className="panel-header">

          <div className="panel-title">
            🔔 Notifications Center
          </div>

        </div>

        <div
          style={{
            color: "var(--muted)",
            fontSize: "0.85rem"
          }}
        >
          Send notifications to all users
          or specific users.
        </div>

      </div>

      {/* STATS */}
<div
  style={{
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
    marginBottom: "20px"
  }}
>

    

  {/* TOTAL */}
  <div
  className="panel"
  style={{
    padding: "24px"
  }}
>

    <div
      style={{
        fontSize: "0.82rem",
        color: "var(--muted)",
        marginBottom: "10px"
      }}
    >
      📨 Total Notifications
    </div>

    <div
      style={{
        fontSize: "2rem",
        fontWeight: 700
      }}
    >
      {totalNotifications}
    </div>

  </div>

  {/* GLOBAL */}
 <div
  className="panel"
  style={{
    padding: "24px"
  }}
>

    <div
      style={{
        fontSize: "0.82rem",
        color: "var(--muted)",
        marginBottom: "10px"
      }}
    >
      🌍 Global Notifications
    </div>

    <div
      style={{
        fontSize: "2rem",
        fontWeight: 700
      }}
    >
      {globalNotifications}
    </div>

  </div>

  {/* USER */}
  <div
  className="panel"
  style={{
    padding: "24px"
  }}
>

    <div
      style={{
        fontSize: "0.82rem",
        color: "var(--muted)",
        marginBottom: "10px"
      }}
    >
      👤 User Notifications
    </div>

    <div
      style={{
        fontSize: "2rem",
        fontWeight: 700
      }}
    >
      {userNotifications}
    </div>

  </div>

  {/* EMERGENCY */}
  <div
  className="panel"
  style={{
    padding: "24px"
  }}
>

    <div
      style={{
        fontSize: "0.82rem",
        color: "var(--muted)",
        marginBottom: "10px"
      }}
    >
      🚨 Emergency Alerts
    </div>

    <div
      style={{
        fontSize: "2rem",
        fontWeight: 700,
        color: "#ef4444"
      }}
    >
      {emergencyNotifications}
    </div>

  </div>

</div>

      {/* GLOBAL */}
      <div
        className="panel"
        style={{
          marginBottom: "20px",
          padding: "24px"
        }}
      >

        <div className="panel-header">

          <div className="panel-title">
            🌍 Global Notification
          </div>

        </div>

        <form
          onSubmit={handleGlobalSubmit}
          style={{
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  maxWidth: "700px"
}}
        >

          <input
            type="text"
            style={inputStyle}
            placeholder="Notification Title"
            value={globalData.title}
            onChange={(e) =>
              setGlobalData({
                ...globalData,
                title: e.target.value
              })
            }
            required
          />

          <textarea
            placeholder="Notification Message"
            rows="5"
            style={inputStyle}
            value={globalData.message}
            onChange={(e) =>
              setGlobalData({
                ...globalData,
                message: e.target.value
              })
            }
            required
          />

          <select
            value={globalData.type}
            style={{
  ...inputStyle,
  cursor: "pointer"
}}
            onChange={(e) =>
              setGlobalData({
                ...globalData,
                type: e.target.value
              })
            }
          >

            <option value="general"
              style={{
    background: "#111827",
    color: "white"
  }}>
              General
            </option>

            <option value="alert"
              style={{
    background: "#111827",
    color: "white"
  }}>
              Alert
            </option>

            <option value="emergency"
              style={{
    background: "#111827",
    color: "white"
  }}>
              Emergency
            </option>

            <option value="parcel"
              style={{
    background: "#111827",
    color: "white"
  }}>
              Parcel
            </option>

            <option value="reward"
              style={{
    background: "#111827",
    color: "white"
  }}>
              Reward
            </option>

          </select>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Send Global Notification"}
          </button>

        </form>

      </div>

      {/* send to USER */}
      <div
  className="panel"
  style={{
    padding: "24px"
  }}
>

        <div className="panel-header">

          <div className="panel-title">
  📨 Send To User
</div>

        </div>

        <form
          onSubmit={handleUserSubmit}
          style={{
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  maxWidth: "700px"
}}
        >

          <input
            type="number"
            style={inputStyle}
            placeholder="User ID"
            value={userData.user_id}
            onChange={(e) =>
              setUserData({
                ...userData,
                user_id: e.target.value
              })
            }
            required
          />

          <input
            type="text"
            style={inputStyle}
            placeholder="Notification Title"
            value={userData.title}
            onChange={(e) =>
              setUserData({
                ...userData,
                title: e.target.value
              })
            }
            required
          />

          <textarea
            placeholder="Notification Message"
            rows="5"
            style={inputStyle}
            value={userData.message}
            onChange={(e) =>
              setUserData({
                ...userData,
                message: e.target.value
              })
            }
            required
          />

          <select
            value={userData.type}
            style={{
  ...inputStyle,
  cursor: "pointer"
}}
            onChange={(e) =>
              setUserData({
                ...userData,
                type: e.target.value
              })
            }
          >

            <option value="general"
              style={{
    background: "#111827",
    color: "white"
  }}>
              General
            </option>

            <option value="alert"
              style={{
    background: "#111827",
    color: "white"
  }}>
              Alert
            </option>

            <option value="emergency"
              style={{
    background: "#111827",
    color: "white"
  }}>
              Emergency
            </option>

            <option value="parcel"
              style={{
    background: "#111827",
    color: "white"
  }}>
              Parcel
            </option>

            <option value="reward"
              style={{
    background: "#111827",
    color: "white"
  }}>
              Reward
            </option>

          </select>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? "Sending..."
              : "Send User Notification"}
          </button>

        </form>

      </div>

      <div
  style={{
    marginBottom: "16px",
    maxWidth: "400px"
  }}
>

  <input
    type="text"
    placeholder="Search notifications..."
    value={search}
    onChange={(e) =>
      setSearch(e.target.value)
    }
    style={inputStyle}
  />

</div>


      {/* HISTORY */}
<div
  className="panel"
style={{
  marginTop: "20px",
  padding: "24px"
}}
>

  <div className="panel-header">

    <div className="panel-title">
      📨 Sent Notifications
    </div>

  </div>

  {notifications.length === 0 ? (

    <div
      style={{
        padding: "20px",
        color: "var(--muted)"
      }}
    >
      No notifications found.
    </div>

  ) : (

    <div
      style={{
        overflowX: "auto"
      }}
    >

      <table
  style={{
    minWidth: "700px"
  }}
>

        <thead>

          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Type</th>
            <th>Target</th>
            <th>Action</th>
            <th>Date</th>
          </tr>

        </thead>

        <tbody>

          {filteredNotifications.map((n) => (

            <tr
  key={n.id}
  style={{
    borderBottom:
      "1px solid rgba(255,255,255,0.05)"
  }}
>

              <td
  style={{
    padding: "14px 10px"
  }}
>
  #{n.id}
</td>

              <td
                style={{
                  fontWeight: 600
                }}
              >
                {n.title}
              </td>

              <td>

  <span
    style={{
      padding: "6px 10px",
      borderRadius: "999px",
      fontSize: "0.75rem",
      fontWeight: 600,
      background:
        n.type === "emergency"
          ? "rgba(239,68,68,.15)"
          : n.type === "alert"
          ? "rgba(245,158,11,.15)"
          : n.type === "reward"
          ? "rgba(16,185,129,.15)"
          : n.type === "parcel"
          ? "rgba(139,92,246,.15)"
          : "rgba(59,130,246,.15)",

      color:
        n.type === "emergency"
          ? "#ef4444"
          : n.type === "alert"
          ? "#f59e0b"
          : n.type === "reward"
          ? "#10b981"
          : n.type === "parcel"
          ? "#8b5cf6"
          : "#3b82f6"
    }}
  >
    {n.type}
  </span>

</td>

              <td
  style={{
    padding: "14px 10px"
  }}
>

  {n.is_global === 1
    ? "🌍 Global"
    : `👤 User #${n.user_id}`}

</td>

              <td
  style={{
    padding: "14px 10px"
  }}
>

  <button
    className="btn btn-ghost"
    style={{
      fontSize: "0.75rem"
    }}
    onClick={() =>
      handleDelete(n.id)
    }
  >
    Delete
  </button>

</td>

              <td
  style={{
    padding: "14px 10px"
  }}
>

  {new Date(n.created_at)
    .toLocaleString()}

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