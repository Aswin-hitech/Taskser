import { useEffect, useMemo, useState } from "react";
import api from "../context/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.viewed).length,
    [notifications]
  );

  const allSelected =
    notifications.length > 0 && selectedNotifications.length === notifications.length;

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data.notifications || []);
      setSelectedNotifications([]);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsViewed = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/view`);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id ? { ...notification, viewed: true } : notification
        )
      );
    } catch (err) {
      console.error("Failed to mark viewed", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/api/notifications/mark-all-read");
      setNotifications((prev) => prev.map((notification) => ({ ...notification, viewed: true })));
      setSelectedNotifications([]);
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  const clearAllNotifications = async () => {
    if (!window.confirm("Clear all notifications?")) return;

    try {
      await api.delete("/api/notifications/clear-all");
      setNotifications([]);
      setSelectedNotifications([]);
    } catch (err) {
      console.error("Failed to clear notifications", err);
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm("Delete this notification?")) return;

    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications((prev) => prev.filter((notification) => notification._id !== id));
      setSelectedNotifications((prev) => prev.filter((selectedId) => selectedId !== id));
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  };

  const deleteSelectedNotifications = async () => {
    if (selectedNotifications.length === 0) return;
    if (!window.confirm(`Delete ${selectedNotifications.length} selected notification(s)?`)) return;

    try {
      await api.delete("/api/notifications/bulk", { data: { ids: selectedNotifications } });
      setNotifications((prev) =>
        prev.filter((notification) => !selectedNotifications.includes(notification._id))
      );
      setSelectedNotifications([]);
    } catch (err) {
      console.error("Failed to delete selected notifications", err);
    }
  };

  const toggleSelectNotification = (id) => {
    setSelectedNotifications((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedNotifications(allSelected ? [] : notifications.map((notification) => notification._id));
  };

  return (
    <div className="page-container">
      <h1>Notifications</h1>

      <div className="notification-controls-bar">
        <div className="notification-stats">
          <span>Total: {notifications.length}</span>
          <span>Unread: {unreadCount}</span>
        </div>

        <div className="notification-actions">
          <button onClick={markAllAsRead} className="action-btn mark-all-read" disabled={unreadCount === 0}>
            Mark All Read
          </button>
          <button
            onClick={deleteSelectedNotifications}
            className="action-btn delete-selected danger"
            disabled={selectedNotifications.length === 0}
          >
            Delete Selected
          </button>
          <button onClick={toggleSelectAll} className="action-btn select-all">
            {allSelected ? "Deselect All" : "Select All"}
          </button>
          <button onClick={clearAllNotifications} className="action-btn select-all">
            Clear All
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">!</div>
          <h3>No notifications yet</h3>
          <p>Task reminders and updates will appear here.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${notification.viewed ? "read" : "unread"} ${
                selectedNotifications.includes(notification._id) ? "selected" : ""
              }`}
            >
              <div className="notification-checkbox">
                <input
                  type="checkbox"
                  checked={selectedNotifications.includes(notification._id)}
                  onChange={() => toggleSelectNotification(notification._id)}
                />
              </div>

              <div
                className="notification-content"
                onClick={() => !notification.viewed && markAsViewed(notification._id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    markAsViewed(notification._id);
                  }
                }}
              >
                <div className="notification-header">
                  <strong className="notification-type">
                    {notification.type.replaceAll("_", " ").toUpperCase()}
                  </strong>
                  {!notification.viewed ? <span className="unread-badge">New</span> : null}
                </div>

                <p className="notification-message">{notification.message}</p>

                <div className="notification-footer">
                  <small className="notification-time">
                    {new Date(notification.createdAt).toLocaleString()}
                  </small>

                  <div className="notification-item-actions">
                    {!notification.viewed ? (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          markAsViewed(notification._id);
                        }}
                        className="small-btn mark-read"
                        type="button"
                      >
                        Mark Read
                      </button>
                    ) : null}

                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteNotification(notification._id);
                      }}
                      className="small-btn delete-btn danger"
                      type="button"
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
