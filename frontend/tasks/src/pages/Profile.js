import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Assuming you have this hook

export default function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProfileAndStats = async () => {
      try {
        // Fetch user statistics
        const profileRes = await axios.get("/api/auth/me");
        const statsRes = await axios.get("/api/stats");


        setProfileData(profileRes.data);
        setStats(statsRes.data);
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

  // Format time for digital clock
  const formatTime = (date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString([], {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-profile">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="page-container">
        <div className="error-profile">
          <h2>⚠️</h2>
          <p>Failed to load profile data</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container profile-page">
      <h1 className="profile-title">Profile</h1>

      {/* Digital Clock Section */}
      <div className="digital-clock-container">
        <div className="digital-clock">
          <div className="time-display">{formatTime(currentTime)}</div>
          <div className="date-display">{formatDate(currentTime)}</div>
        </div>
      </div>

      {/* User Info Card */}
      <div className="profile-card primary-card">
        <div className="profile-header">
          <div className="avatar">
            {profileData.username.charAt(0).toUpperCase()}
          </div>
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

      {/* Statistics Section */}
      {stats && (
        <div className="stats-section">
          <h3 className="section-title">Your Activity</h3>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalTasks || 0}</div>
                <div className="stat-label">Total Tasks</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <div className="stat-value">{stats.completedTasks || 0}</div>
                <div className="stat-label">Completed</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalNotes || 0}</div>
                <div className="stat-label">Notes</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <div className="stat-value">{stats.activeStreak || 0}</div>
                <div className="stat-label">Day Streak</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="activity-section">
        <h3 className="section-title">Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">🕒</div>
            <div className="activity-content">
              <p>Last login: Today</p>
              <span className="activity-time">Just now</span>
            </div>
          </div>

          <div className="activity-item">
            <div className="activity-icon">📱</div>
            <div className="activity-content">
              <p>Currently using: Web App</p>
              <span className="activity-time">This session</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="actions-section">
        <h3 className="section-title">Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => window.location.href = '/settings'}>
            <span className="action-icon">⚙️</span>
            <span className="action-text">Settings</span>
          </button>

          <button className="action-btn" onClick={() => window.location.href = '/dashboard'}>
            <span className="action-icon">📊</span>
            <span className="action-text">Dashboard</span>
          </button>

          <button className="action-btn" onClick={() => window.location.href = '/tasks'}>
            <span className="action-icon">➕</span>
            <span className="action-text">New Task</span>
          </button>
        </div>
      </div>
    </div>
  );
}