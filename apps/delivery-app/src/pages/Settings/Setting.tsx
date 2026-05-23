import React, { useState } from 'react';
import './Setting.css';

const SettingsPage = () => {
  // State for form fields
  const [language, setLanguage] = useState('English');
  const [theme, setTheme] = useState('Light');
  const [enableSounds, setEnableSounds] = useState(false);
  const [autoUpdateApp, setAutoUpdateApp] = useState(true);

  // Handle save changes
  const handleSave = () => {
    console.log('Settings saved:', { language, theme, enableSounds, autoUpdateApp });
    alert('Settings saved successfully!');
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <h1 className="settings-title">Manage your preferences</h1>
        
        {/* Main Content Area - Only General Settings */}
        <main className="settings-content">
          <h2 className="section-title">General Settings</h2>
          
          <div className="settings-form">
            {/* Language Setting */}
            <div className="setting-item">
              <label className="setting-label">Language</label>
              <select 
                className="setting-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Hindi</option>
              </select>
            </div>
            
            {/* Theme Setting */}
            <div className="setting-item">
              <label className="setting-label">Theme</label>
              <div className="theme-buttons">
                <button 
                  className={`theme-btn ${theme === 'Light' ? 'active' : ''}`}
                  onClick={() => setTheme('Light')}
                >
                  Light
                </button>
                <button 
                  className={`theme-btn ${theme === 'Dark' ? 'active' : ''}`}
                  onClick={() => setTheme('Dark')}
                >
                  Dark
                </button>
                <button 
                  className={`theme-btn ${theme === 'System' ? 'active' : ''}`}
                  onClick={() => setTheme('System')}
                >
                  System
                </button>
              </div>
            </div>
            
            {/* Enable Sounds Toggle */}
            <div className="setting-item toggle-item">
              <label className="setting-label">Enable Sounds</label>
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={enableSounds}
                  onChange={(e) => setEnableSounds(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            {/* Auto Update App Toggle */}
            <div className="setting-item toggle-item">
              <label className="setting-label">Auto Update App</label>
              <label className="toggle-switch">
                <input 
                  type="checkbox"
                  checked={autoUpdateApp}
                  onChange={(e) => setAutoUpdateApp(e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            
            {/* Save Button */}
            <div className="save-button-container">
              <button className="save-btn" onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;