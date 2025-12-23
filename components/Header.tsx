
import React from 'react';
import { Settings, SessionState } from '../types';
import { Icons } from './icons';
import '../src/styles/Header.css';

interface HeaderProps {
  settings: Settings;
  session: SessionState;
  onOpenSettings: () => void;
  onOpenEditor: () => void;
  isEditorOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ settings, session, onOpenSettings, onOpenEditor, isEditorOpen }) => {
  const progressPercent = session.chunks.length > 0 
    ? (session.revealedCount / session.chunks.length) * 100
    : 0;
  const progressDisplay = progressPercent.toFixed(2);
  const progressFill = Math.round(progressPercent);

  return (
    <header className="header">
      <div className="header-logo">
        <div className="header-logo-icon">
          W
        </div>
        <div className="header-title">
          <h1>WordReveal</h1>
          <p>Interactive Study Tool</p>
        </div>
      </div>

      <div className="header-progress">
        <div className="header-progress-container">
          <div className="header-progress-label">
            <span className="header-progress-label-text">Progress</span>
            <span>{progressDisplay}%</span>
          </div>
          <div className="header-progress-bar">
            <div 
              className="header-progress-fill" 
              style={{ width: `${progressFill}%` }}
            />
          </div>
        </div>
      </div>

      <div className="header-actions">
        <button 
          onClick={onOpenEditor}
          className={`header-button ${isEditorOpen ? 'active' : ''}`}
          title="Edit Content"
        >
          <Icons.Edit className="header-button-icon" />
        </button>
        <button 
          onClick={onOpenSettings}
          className="header-button"
          title="Settings"
        >
          <Icons.Settings className="header-button-icon" />
        </button>
      </div>
    </header>
  );
};

export default Header;
