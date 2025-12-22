
import React from 'react';
import { Settings, Theme, RevealMode } from '../types';
import { Icons } from './icons';

interface SettingsProps {
  settings: Settings;
  onUpdate: (updates: Partial<Settings>) => void;
  onClose: () => void;
  onResetProgress: () => void;
}

const SettingsPanel: React.FC<SettingsProps> = ({ settings, onUpdate, onClose, onResetProgress }) => {
  const getStepsLabel = () => {
    switch (settings.revealMode) {
      case RevealMode.WORD:
        return 'Words per Keypress';
      case RevealMode.SENTENCE:
        return 'Sentences per Keypress';
      case RevealMode.ROW:
        return 'Rows per Keypress';
      default:
        return 'Steps per Keypress';
    }
  };

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div 
        className="settings-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button onClick={onClose} className="settings-close">
            <Icons.Close />
          </button>
        </div>

        <div className="settings-content">
          {/* Appearance Section */}
          <section className="settings-section">
            <h3 className="settings-section-title">Appearance</h3>
            <div className="settings-group">
              <div className="settings-group">
                <label className="settings-label">Theme</label>
                <div className="settings-theme-toggle">
                  <button 
                    onClick={() => onUpdate({ theme: Theme.LIGHT })}
                    className={`settings-theme-button ${settings.theme === Theme.LIGHT ? 'light' : 'inactive'}`}
                  >
                    Light
                  </button>
                  <button 
                    onClick={() => onUpdate({ theme: Theme.DARK })}
                    className={`settings-theme-button ${settings.theme === Theme.DARK ? 'dark' : 'inactive'}`}
                  >
                    Dark
                  </button>
                </div>
              </div>
              <div className="settings-group">
                <label className="settings-label">Font Size ({settings.fontSize}px)</label>
                <input 
                  type="range" min="12" max="32" step="1" 
                  value={settings.fontSize}
                  onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
                  className="settings-range"
                />
              </div>
            </div>
          </section>

          {/* Reveal Logic Section */}
          <section className="settings-section">
            <h3 className="settings-section-title">Reveal Logic</h3>
            <div className="settings-group">
              <label className="settings-label">Reveal Mode</label>
              <div className="settings-reveal-buttons">
                {[RevealMode.WORD, RevealMode.SENTENCE /*, RevealMode.ROW */].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => onUpdate({ revealMode: mode })}
                    className={`settings-reveal-button ${settings.revealMode === mode ? 'active' : ''}`}
                  >
                    {mode.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center justify-between flex-1">
                <label className="settings-label">{getStepsLabel()}</label>
                <select
                  value={settings.wordsPerStep}
                  onChange={(e) => onUpdate({ wordsPerStep: Number(e.target.value) })}
                  className="settings-select"
                >
                  {Array.from({ length: 50 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
              {/* Highlight Mode - Disabled */}
              {/* <div className="settings-highlight-toggle settings-highlight-toggle-compact">
                <div className="settings-highlight-content">
                  <span className="settings-highlight-title">Highlight Mode</span>
                  <span className="settings-highlight-description">Click chunks to keep them visible</span>
                </div>
                <label className="settings-toggle">
                  <input
                    type="checkbox"
                    checked={settings.highlightMode}
                    onChange={(e) => onUpdate({ highlightMode: e.target.checked })}
                    className="settings-toggle-input"
                  />
                </label>
              </div> */}
            </div>
          </section>

          {/* Controls */}
          <section className="settings-section">
            <button 
              onClick={onResetProgress}
              className="settings-button danger"
            >
              Reset Study Progress
            </button>
          </section>
        </div>

        <div className="settings-actions">
          <button 
            onClick={onClose}
            className="settings-button primary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
