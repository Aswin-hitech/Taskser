import { useState, useEffect } from "react";
import { notificationSound } from "../utils/notificationEngine";

export default function Settings() {
  const [rememberMe, setRememberMe] = useState(
    localStorage.getItem("rememberMe") === "true"
  );
  
  const [soundSettings, setSoundSettings] = useState({
    enabled: true,
    volume: 0.5,
  });

  // Load sound settings from localStorage on mount
  useEffect(() => {
    const savedSoundSettings = localStorage.getItem("soundSettings");
    if (savedSoundSettings) {
      const parsed = JSON.parse(savedSoundSettings);
      setSoundSettings(parsed);
      notificationSound.enabled = parsed.enabled;
      notificationSound.setVolume(parsed.volume);
    }
  }, []);

  // Save sound settings to localStorage
  useEffect(() => {
    localStorage.setItem("soundSettings", JSON.stringify(soundSettings));
    notificationSound.enabled = soundSettings.enabled;
    notificationSound.setVolume(soundSettings.volume);
  }, [soundSettings]);

  const toggleRememberMe = () => {
    const value = !rememberMe;
    setRememberMe(value);
    localStorage.setItem("rememberMe", value);
  };

  const toggleSound = () => {
    setSoundSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  const handleVolumeChange = (e) => {
    const volume = parseFloat(e.target.value);
    setSoundSettings(prev => ({
      ...prev,
      volume
    }));
  };

  const testSound = () => {
    notificationSound.play();
  };

  return (
    <div className="page-container">
      <h1>Settings</h1>

      <div className="soft-card wide-section">
        <h3>Appearance</h3>
        <label className="settings-option">
          <input type="radio" defaultChecked /> Dark (current)
        </label>

        <label className="settings-option">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={toggleRememberMe}
          />
          Save login info
        </label>
      </div>

      <div className="soft-card wide-section">
        <h3>Notifications</h3>
        <label className="settings-option">
          <input type="checkbox" defaultChecked /> Browser notifications
        </label>
        
        {/* Sound Settings */}
        <div className="sound-settings">
          <h4>Notification Sound</h4>
          
          <div className="sound-toggle">
            <label className="settings-option">
              <input
                type="checkbox"
                checked={soundSettings.enabled}
                onChange={toggleSound}
              />
              Enable notification sound
            </label>
            
            <button 
              onClick={testSound} 
              className="test-sound-btn"
              disabled={!soundSettings.enabled}
            >
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
              onChange={handleVolumeChange}
              disabled={!soundSettings.enabled}
            />
            <div className="volume-levels">
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
            </div>
          </div>
        </div>
        
        <label className="settings-option">
          <input type="checkbox" defaultChecked /> Show overdue tasks in red
        </label>
      </div>

      <div className="soft-card wide-section">
        <h3>Notification Sound Tone</h3>
        <select defaultValue="tone1" className="tone-selector">
          <option value="tone1">Default Tone</option>
          <option value="tone2">Soft Tone</option>
          <option value="tone3">Alert Tone</option>
          <option value="tone4">Melodic Tone</option>
        </select>
        <p className="setting-description">
          Current tone: <strong>tone1.mp3</strong>
        </p>
      </div>

      <div className="soft-card wide-section">
        <h3>Account</h3>
        <button className="danger">Delete Account</button>
        <p>This action cannot be undone.</p>
      </div>
    </div>
  );
}
