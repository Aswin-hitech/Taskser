import { useEffect, useState } from "react";
import axios from "axios";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("/api/notifications");
      setNotifications(res.data);
      setSelectedNotifications([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/view`, {});
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, viewed: true } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark viewed", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.put("/api/notifications/mark-all-read", {});

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, viewed: true }))
      );
      setSelectedNotifications([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) {
      return;
    }

    try {
      await axios.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      setSelectedNotifications((prev) => prev.filter((selectedId) => selectedId !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const deleteSelectedNotifications = async () => {
    if (selectedNotifications.length === 0) {
      alert("Please select notifications to delete");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedNotifications.length} notification(s)?`)) {
      return;
    }

    try {
      await axios.delete("/api/notifications", {
        data: { ids: selectedNotifications }
      });

      // Remove deleted notifications from state
      setNotifications((prev) =>
        prev.filter((n) => !selectedNotifications.includes(n._id))
      );
      setSelectedNotifications([]);
      setSelectAll(false);
    } catch (err) {
      console.error("Failed to delete selected notifications", err);
    }
  };

  const handleSelectNotification = (id) => {
    setSelectedNotifications((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map((n) => n._id));
    }
    setSelectAll(!selectAll);
  };

  const getUnreadCount = () => {
    return notifications.filter((n) => !n.viewed).length;
  };

  return (
    <div className="page-container">
      <h1>Notifications</h1>

      {/* Notification Controls */}
      <div className="notification-controls-bar">
        <div className="notification-stats">
          <span className="total-count">Total: {notifications.length}</span>
          <span className="unread-count">Unread: {getUnreadCount()}</span>
        </div>

        <div className="notification-actions">
          <button
            onClick={markAllAsRead}
            className="action-btn mark-all-read"
            disabled={getUnreadCount() === 0}
          >
            Mark All as Read
          </button>

          <button
            onClick={deleteSelectedNotifications}
            className="action-btn delete-selected danger"
            disabled={selectedNotifications.length === 0}
          >
            Delete Selected ({selectedNotifications.length})
          </button>

          <button
            onClick={handleSelectAll}
            className="action-btn select-all"
          >
            {selectAll ? "Deselect All" : "Select All"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <h3>No notifications yet</h3>
          <p>You'll see notifications here for task reminders and updates</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notif) => (
            <div
              key={notif._id}
              className={`notification-item ${notif.viewed ? "read" : "unread"} ${selectedNotifications.includes(notif._id) ? "selected" : ""
                }`}
            >
              <div className="notification-checkbox">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notif._id)}
                  onChange={() => handleSelectNotification(notif._id)}
                />
              </div>

              <div
                className="notification-content"
                onClick={() => !notif.viewed && markAsViewed(notif._id)}
              >
                <div className="notification-header">
                  <strong className="notification-type">
                    {notif.type.replace("_", " ").toUpperCase()}
                  </strong>
                  {!notif.viewed && <span className="unread-badge">NEW</span>}
                </div>

                <p className="notification-message">{notif.message}</p>

                <div className="notification-footer">
                  <small className="notification-time">
                    {new Date(notif.createdAt).toLocaleString()}
                  </small>

                  <div className="notification-item-actions">
                    {!notif.viewed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsViewed(notif._id);
                        }}
                        className="small-btn mark-read"
                      >
                        Mark as Read
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif._id);
                      }}
                      className="small-btn delete-btn danger"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}