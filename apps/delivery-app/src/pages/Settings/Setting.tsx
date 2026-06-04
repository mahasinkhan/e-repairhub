import { useState, useEffect } from "react";
import {
  Settings, Bell, MapPin, Globe, Moon, Sun, Monitor,
  CheckCircle2, Volume2, Zap, Shield, Info,
} from "lucide-react";
import "./Setting.css";

const STORAGE_KEY = "delivery_settings_v1";

const DEFAULTS = {
  language:        "English",
  theme:           "Light",
  taskAlerts:      true,
  smsNotifs:       true,
  emailNotifs:     false,
  autoGps:         true,
  autoAcceptTasks: false,
  soundEnabled:    true,
};

function load() {
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
  catch { return { ...DEFAULTS }; }
}

function Toggle({ checked, onChange }) {
  return (
    <label className="sg-toggle">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} />
      <span className="sg-toggle-track">
        <span className="sg-toggle-thumb" />
      </span>
    </label>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="sg-card">
      <div className="sg-section-head">
        <div className="sg-section-icon"><Icon size={15} /></div>
        <h3 className="sg-section-title">{title}</h3>
      </div>
      <div className="sg-section-body">{children}</div>
    </div>
  );
}

function Row({ label, sub, children }) {
  return (
    <div className="sg-row">
      <div className="sg-row-text">
        <span className="sg-row-label">{label}</span>
        {sub && <span className="sg-row-sub">{sub}</span>}
      </div>
      <div className="sg-row-control">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(load);
  const [saved,    setSaved]    = useState(false);

  const set = (key, val) => setSettings(p => ({ ...p, [key]: val }));

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const THEMES = [
    { key: "Light",  Icon: Sun     },
    { key: "Dark",   Icon: Moon    },
    { key: "System", Icon: Monitor },
  ];

  const LANGS = ["English", "Hindi", "Bengali", "Tamil", "Telugu", "Marathi"];

  return (
    <div className="sg-root">

      {/* Header */}
      <div className="sg-page-head">
        <div>
          <h1 className="sg-title">Settings</h1>
          <p className="sg-subtitle">Manage your preferences</p>
        </div>
        <button className="sg-save-btn" onClick={handleSave}>
          {saved ? <><CheckCircle2 size={14} /> Saved!</> : <><Settings size={14} /> Save Changes</>}
        </button>
      </div>

      {/* Toast */}
      {saved && (
        <div className="sg-toast">
          <CheckCircle2 size={15} /> Preferences saved successfully
        </div>
      )}

      {/* General */}
      <Section title="General" icon={Globe}>
        <Row label="Language" sub="App display language">
          <select className="sg-select" value={settings.language}
            onChange={e => set("language", e.target.value)}>
            {LANGS.map(l => <option key={l}>{l}</option>)}
          </select>
        </Row>
        <Row label="Theme" sub="Choose app appearance">
          <div className="sg-theme-btns">
            {THEMES.map(({ key, Icon }) => (
              <button key={key}
                className={`sg-theme-btn ${settings.theme === key ? "sg-theme-active" : ""}`}
                onClick={() => set("theme", key)}>
                <Icon size={13} /> {key}
              </button>
            ))}
          </div>
        </Row>
        <Row label="Sound Effects" sub="Button and alert sounds">
          <Toggle checked={settings.soundEnabled} onChange={v => set("soundEnabled", v)} />
        </Row>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <Row label="Task Alerts" sub="Get notified when tasks are assigned">
          <Toggle checked={settings.taskAlerts} onChange={v => set("taskAlerts", v)} />
        </Row>
        <Row label="SMS Notifications" sub="Receive task updates via SMS">
          <Toggle checked={settings.smsNotifs} onChange={v => set("smsNotifs", v)} />
        </Row>
        <Row label="Email Notifications" sub="Daily summary emails">
          <Toggle checked={settings.emailNotifs} onChange={v => set("emailNotifs", v)} />
        </Row>
      </Section>

      {/* Delivery */}
      <Section title="Delivery Preferences" icon={Zap}>
        <Row label="Auto GPS" sub="Automatically enable GPS for navigation">
          <Toggle checked={settings.autoGps} onChange={v => set("autoGps", v)} />
        </Row>
        <Row label="Auto-Accept Tasks" sub="Automatically accept newly assigned tasks">
          <Toggle checked={settings.autoAcceptTasks} onChange={v => set("autoAcceptTasks", v)} />
        </Row>
      </Section>

      {/* About */}
      <Section title="About" icon={Info}>
        <Row label="App Version"   sub="E-RepairHub Delivery Portal"><span className="sg-about-val">v1.0.0</span></Row>
        <Row label="Build"         sub="Current build"><span className="sg-about-val">2026.06</span></Row>
        <Row label="Privacy Policy" sub="View our data policy">
          <button className="sg-link-btn">View →</button>
        </Row>
      </Section>

    </div>
  );
}