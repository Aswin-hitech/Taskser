import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { notificationSound } from "../utils/notificationEngine";

const defaultSoundSettings = {
  enabled: true,
  volume: 0.5,
};

export default function Settings() {
  const { deleteAccount } = useContext(AuthContext);
  const [rememberMe, setRememberMe] = useState(true);
  const [soundSettings, setSoundSettings] = useState(defaultSoundSettings);
  const [permission, setPermission] = useState(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );
  const [deletePassword, setDeletePassword] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const savedRememberPreference = localStorage.getItem("rememberMePreference");
    if (savedRememberPreference) {
      setRememberMe(savedRememberPreference === "true");
    }

    const savedSoundSettings = localStorage.getItem("soundSettings");
    if (savedSoundSettings) {
      const parsed = JSON.parse(savedSoundSettings);
      setSoundSettings(parsed);
      notificationSound.enabled = parsed.enabled;
      notificationSound.setVolume(parsed.volume);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("rememberMePreference", String(rememberMe));
  }, [rememberMe]);

  useEffect(() => {
    localStorage.setItem("soundSettings", JSON.stringify(soundSettings));
    notificationSound.enabled = soundSettings.enabled;
    notificationSound.setVolume(soundSettings.volume);
  }, [soundSettings]);

  const permissionLabel = useMemo(() => {
    if (permission === "granted") return "Enabled";
    if (permission === "denied") return "Blocked";
    if (permission === "unsupported") return "Unavailable";
    return "Not requested";
  }, [permission]);

  const requestPermission = async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  const testSound = () => {
    notificationSound.play();
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setFeedback("Enter your password to delete the account.");
      return;
    }

    if (!window.confirm("This permanently deletes your account and all related data. Continue?")) {
      return;
    }

    const result = await deleteAccount(deletePassword);
    if (!result.success) {
      setFeedback(result.message);
      return;
    }

    setFeedback("");
  };

  return (
    <div className="page-container">
      <h1>Settings</h1>

      <div className="soft-card wide-section">
        <h2>Session</h2>
        <label className="settings-option">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe((value) => !value)}
          />
          Prefer staying signed in on this device
        </label>
        <p className="setting-description">
          This setting is applied the next time you log in or register.
        </p>
      </div>

      <div className="soft-card wide-section">
        <h2>Notifications</h2>
        <div className="notification-preference-row">
          <span>Browser notifications</span>
          <strong>{permissionLabel}</strong>
        </div>
        <button onClick={requestPermission} type="button">
          Request Permission
        </button>

        <div className="sound-settings">
          <div className="sound-toggle">
            <label className="settings-option">
              <input
                type="checkbox"
                checked={soundSettings.enabled}
                onChange={() =>
                  setSoundSettings((previous) => ({
                    ...previous,
                    enabled: !previous.enabled,
                  }))
                }
              />
              Enable notification sound
            </label>

            <button onClick={testSound} className="test-sound-btn" disabled={!soundSettings.enabled} type="button">
              Test Sound
            </button>
          </div>

          <div className="volume-control">
            <label>Volume: {Math.round(soundSettings.volume * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={soundSettings.volume}
              onChange={(event) =>
                setSoundSettings((previous) => ({
                  ...previous,
                  volume: parseFloat(event.target.value),
                }))
              }
              disabled={!soundSettings.enabled}
            />
          </div>
        </div>
      </div>

      <div className="soft-card wide-section danger-zone">
        <h2>Delete Account</h2>
        <p className="setting-description">
          This removes your account, tasks, notes, notifications, and checklists.
        </p>
        <input
          type="password"
          placeholder="Confirm with your password"
          value={deletePassword}
          onChange={(event) => setDeletePassword(event.target.value)}
        />
        {feedback ? <p className="form-error">{feedback}</p> : null}
        <button className="danger" onClick={handleDeleteAccount} type="button">
          Delete Account
        </button>
      </div>
    </div>
  );
}
