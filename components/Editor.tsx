
import React, { useState } from 'react';
import { Icons } from './icons';
import '../src/styles/Editor.css';

interface EditorProps {
  onSave: (text: string) => void;
  onCancel: () => void;
  initialText: string;
}

const Editor: React.FC<EditorProps> = ({ onSave, onCancel, initialText }) => {
  const [text, setText] = useState(initialText);

  const handleExport = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-content-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setText(ev.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="editor-overlay" onClick={onCancel}>
      <div 
        className="editor-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="editor-header">
          <div className="editor-header-left">
            <button onClick={onCancel} className="editor-close">
              <Icons.Close />
            </button>
            <h2 className="editor-title">Edit Study Content</h2>
          </div>
          <div className="editor-header-actions">
            <label className="editor-icon-button" title="Import TXT">
              <Icons.Import className="editor-icon-button-icon" />
              <input type="file" accept=".txt" onChange={handleImport} className="hidden" />
            </label>
            <button 
              onClick={handleExport}
              className="editor-icon-button"
              title="Export TXT"
            >
              <Icons.Export className="editor-icon-button-icon" />
            </button>
            <button 
              onClick={() => onSave(text)}
              className="editor-icon-button primary"
              title="Save & Close"
            >
              <Icons.Save className="editor-icon-button-icon" />
            </button>
          </div>
        </div>
        
        <div className="editor-content">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text, code, or theory here..."
            className="editor-textarea"
            autoFocus
          />
          <div className="editor-stats">
            <span>Words: {text.trim().split(/\s+/).filter(Boolean).length}</span>
            <span>Characters: {text.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
