import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../context/api";

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        const [profileRes, statsRes] = await Promise.all([
          api.get("/api/auth/me"),
          api.get("/api/stats"),
        ]);

        setProfileData(profileRes.data.user);
        setStats(statsRes.data.stats);
      } catch (error) {
        console.error("Failed to load profile:", error);
        setProfileData(null);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndStats();
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>Profile unavailable</h2>
          <p>We could not load your profile data right now.</p>
          <button onClick={() => window.location.reload()} className="retry-btn" type="button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container profile-page">
      <h1 className="profile-title">Profile</h1>

      <div className="digital-clock-container">
        <div className="digital-clock">
          <div className="time-display">
            {currentTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}
          </div>
          <div className="date-display">
            {currentTime.toLocaleDateString([], {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="profile-card primary-card">
        <div className="profile-header">
          <div className="avatar">{profileData.username.charAt(0).toUpperCase()}</div>
          <div className="profile-info">
            <h2 className="username">{profileData.username}</h2>
            <p className="member-since">
              Member since {new Date(profileData.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">User ID</span>
            <span className="detail-value">{profileData._id?.substring(0, 8)}...</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Account Type</span>
            <span className="detail-value badge">Standard</span>
          </div>
        </div>
      </div>

      {stats ? (
        <div className="stats-section">
          <h2 className="section-title">Your Activity</h2>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{stats.totalTasks || 0}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{stats.completedTasks || 0}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{stats.totalNotes || 0}</div>
                <div className="stat-label">Notes</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-content">
                <div className="stat-value">{stats.activeStreak || 0}</div>
                <div className="stat-label">Best Current Streak</div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="activity-section">
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-content">
              <p>Last session refreshed successfully</p>
              <span className="activity-time">Current session</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-content">
              <p>Workspace synced with your latest stats</p>
              <span className="activity-time">Just now</span>
            </div>
          </div>
        </div>
      </div>

      <div className="actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => navigate("/settings")} type="button">
            <span className="action-text">Settings</span>
          </button>

          <button className="action-btn" onClick={() => navigate("/dashboard")} type="button">
            <span className="action-text">Dashboard</span>
          </button>

          <button className="action-btn" onClick={() => navigate("/notes")} type="button">
            <span className="action-text">Notes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
