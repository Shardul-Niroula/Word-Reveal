
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import StudyArea from './components/StudyArea';
import Editor from './components/Editor';
import SettingsPanel from './components/Settings';
import { Icons } from './components/icons';
import { 
  RevealMode, 
  Theme, 
  Settings, 
  SessionState 
} from './types';
import { 
  DEFAULT_SETTINGS, 
  DEMO_TEXT, 
  STORAGE_KEY, 
  SETTINGS_KEY 
} from './constants';
import { splitTextIntoChunks, formatTime } from './utils';

const App: React.FC = () => {
  // Persistence Loading
  const loadSettings = (): Settings => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  };

  const loadSession = (): SessionState => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    const initialChunks = splitTextIntoChunks(DEMO_TEXT, DEFAULT_SETTINGS.revealMode);
    return {
      originalText: DEMO_TEXT,
      chunks: initialChunks,
      currentIndex: 0,
      revealedCount: 0,
      startTime: null,
      streak: 0,
      lastPracticeDate: null,
    };
  };

  // State
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [session, setSession] = useState<SessionState>(loadSession);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Refs for hold-to-repeat functionality
  const revealIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hideIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Timeout refs to distinguish quick clicks from holds
  const revealTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer Logic
  useEffect(() => {
    let interval: number;
    if (session.startTime && session.revealedCount < session.chunks.length) {
      interval = window.setInterval(() => {
        setElapsedTime(Date.now() - (session.startTime || Date.now()));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [session.startTime, session.revealedCount, session.chunks.length]);

  // Save Persistence
  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    if (settings.theme === Theme.DARK) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-slate-900', 'text-white');
      document.body.classList.remove('bg-slate-50', 'text-slate-900');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add('bg-slate-50', 'text-slate-900');
      document.body.classList.remove('bg-slate-900', 'text-white');
    }
  }, [settings]);

  useEffect(() => {
    if (settings.autoSave) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  }, [session, settings.autoSave]);

  // Handlers
  const handleUpdateText = useCallback((newText: string) => {
    const newChunks = splitTextIntoChunks(newText, settings.revealMode);
    setSession(prev => ({
      ...prev,
      originalText: newText,
      chunks: newChunks,
      currentIndex: 0,
      revealedCount: 0,
      startTime: null,
    }));
    setElapsedTime(0);
    setIsEditorOpen(false);
  }, [settings.revealMode]);

  const handleReveal = useCallback((count: number) => {
    setSession(prev => {
      if (prev.currentIndex >= prev.chunks.length) return prev;
      
      let nextIndex = prev.currentIndex;
      let itemsRevealed = 0;
      const updatedChunks = [...prev.chunks];

      while (nextIndex < updatedChunks.length && itemsRevealed < count) {
        const chunk = updatedChunks[nextIndex];
        
        // Determine if this chunk counts toward our reveal limit based on mode
        let shouldCount = false;
        
        if (settings.revealMode === RevealMode.WORD) {
          // For words: count non-whitespace chunks
          shouldCount = !/^\s+$/.test(chunk.text);
        } else if (settings.revealMode === RevealMode.SENTENCE) {
          // For sentences: count when we reach a sentence boundary
          // Skip pure whitespace or newline chunks
          if (!/^\s+$/.test(chunk.text) && !/^\n+$/.test(chunk.text) && !/^\s{10,}$/.test(chunk.text)) {
            // This is content; check if next chunk is punctuation or large gap
            const nextChunk = nextIndex + 1 < updatedChunks.length ? updatedChunks[nextIndex + 1] : null;
            const nextIsPunctuation = nextChunk && /^[.!?]+/.test(nextChunk.text);
            const nextIsLargeGap = nextChunk && /^\s{10,}$/.test(nextChunk.text);
            const nextIsNewline = nextChunk && /^\n+$/.test(nextChunk.text);
            
            shouldCount = /[.!?]+\s*$/.test(chunk.text) || nextIsPunctuation || nextIsLargeGap || nextIsNewline;
          }
        } else if (settings.revealMode === RevealMode.ROW) {
          // For rows: count newline chunks
          shouldCount = /\n/.test(chunk.text);
        }
        
        updatedChunks[nextIndex].isRevealed = true;
        if (shouldCount) {
          itemsRevealed++;
          // After counting a sentence, skip any trailing whitespace/punctuation/boundary chunks
          nextIndex++;
          if (settings.revealMode === RevealMode.SENTENCE) {
            while (nextIndex < updatedChunks.length) {
              const trailingChunk = updatedChunks[nextIndex];
              const isTrailing = /^\s+$/.test(trailingChunk.text) || 
                                /^[.!?]+/.test(trailingChunk.text) ||
                                /^\s{10,}$/.test(trailingChunk.text) ||
                                /^\n+$/.test(trailingChunk.text);
              if (isTrailing) {
                updatedChunks[nextIndex].isRevealed = true;
                nextIndex++;
              } else {
                break;
              }
            }
          }
        } else {
          nextIndex++;
        }
      }

      // Reveal any trailing whitespace after the counted items
      while (nextIndex < updatedChunks.length && /^\s+$/.test(updatedChunks[nextIndex].text) && !/\n/.test(updatedChunks[nextIndex].text)) {
        updatedChunks[nextIndex].isRevealed = true;
        nextIndex++;
      }

      return {
        ...prev,
        chunks: updatedChunks,
        currentIndex: nextIndex,
        revealedCount: updatedChunks.filter(c => c.isRevealed).length,
        startTime: prev.startTime || Date.now(),
      };
    });
  }, [settings.revealMode]);

  const handleHide = useCallback((count: number) => {
    setSession(prev => {
      if (prev.currentIndex <= 0) return prev;

      let nextIndex = prev.currentIndex;
      let itemsHidden = 0;
      const updatedChunks = [...prev.chunks];

      while (nextIndex > 0 && itemsHidden < count) {
        nextIndex--;
        const chunk = updatedChunks[nextIndex];
        let shouldCount = false;
        
        if (settings.revealMode === RevealMode.WORD) {
          // For words: count non-whitespace chunks
          shouldCount = !/^\s+$/.test(chunk.text);
        } else if (settings.revealMode === RevealMode.SENTENCE) {
          // For sentences: count when we reach a sentence boundary
          // Skip pure whitespace, newline, or large gap chunks
          if (!/^\s+$/.test(chunk.text) && !/^\n+$/.test(chunk.text) && !/^\s{10,}$/.test(chunk.text)) {
            // This is content; check if it ends with punctuation or is preceded by a boundary
            const prevChunk = nextIndex > 0 ? updatedChunks[nextIndex - 1] : null;
            const prevIsPunctuation = prevChunk && /^[.!?]+/.test(prevChunk.text);
            const prevIsLargeGap = prevChunk && /^\s{10,}$/.test(prevChunk.text);
            const prevIsNewline = prevChunk && /^\n+$/.test(prevChunk.text);
            
            shouldCount = /[.!?]+\s*$/.test(chunk.text) || prevIsPunctuation || prevIsLargeGap || prevIsNewline;
          }
        } else if (settings.revealMode === RevealMode.ROW) {
          // For rows: count newline chunks
          shouldCount = /\n/.test(chunk.text);
        }
        
        updatedChunks[nextIndex].isRevealed = false;
        if (shouldCount) {
          itemsHidden++;
          // After hiding a sentence, skip any preceding whitespace/punctuation/boundary chunks
          if (settings.revealMode === RevealMode.SENTENCE) {
            while (nextIndex > 0) {
              const trailingChunk = updatedChunks[nextIndex - 1];
              const isTrailing = /^\s+$/.test(trailingChunk.text) || 
                                /^[.!?]+/.test(trailingChunk.text) ||
                                /^\s{10,}$/.test(trailingChunk.text) ||
                                /^\n+$/.test(trailingChunk.text);
              if (isTrailing) {
                nextIndex--;
                updatedChunks[nextIndex].isRevealed = false;
              } else {
                break;
              }
            }
          }
        }
      }

      return {
        ...prev,
        chunks: updatedChunks,
        currentIndex: nextIndex,
        revealedCount: updatedChunks.filter(c => c.isRevealed).length,
      };
    });
  }, [settings.revealMode]);

  const handleToggleHighlight = useCallback((chunkId: string) => {
    setSession(prev => ({
      ...prev,
      chunks: prev.chunks.map(c => 
        c.id === chunkId ? { ...c, isHighlighted: !c.isHighlighted } : c
      ),
    }));
  }, []);

  const handleResetProgress = useCallback(() => {
    setSession(prev => ({
      ...prev,
      chunks: prev.chunks.map(c => ({ ...c, isRevealed: false })),
      currentIndex: 0,
      revealedCount: 0,
      startTime: null,
    }));
    setElapsedTime(0);
    setIsSettingsOpen(false);
  }, []);

  const handleShuffle = useCallback(() => {
    setSession(prev => {
      const shuffled = [...prev.chunks].sort(() => Math.random() - 0.5);
      return {
        ...prev,
        chunks: shuffled,
        currentIndex: 0,
        revealedCount: 0,
      };
    });
  }, []);

  // Hold-to-repeat functionality
  const startRevealing = useCallback(() => {
    // If already revealing or a reveal timeout is pending, do nothing
    if (revealIntervalRef.current || revealTimeoutRef.current) return;

    // Start a short timeout to detect a hold (distinguishes click from hold)
    revealTimeoutRef.current = setTimeout(() => {
      // First action after hold threshold
      handleReveal(settings.wordsPerStep);
      // Then begin continuous repeating
      revealIntervalRef.current = setInterval(() => {
        handleReveal(settings.wordsPerStep);
      }, 150);
      revealTimeoutRef.current = null;
    }, 300); // 300ms hold threshold
  }, [handleReveal, settings.wordsPerStep]);

  const stopRevealing = useCallback(() => {
    // Clear pending timeout and active interval
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    if (revealIntervalRef.current) {
      clearInterval(revealIntervalRef.current);
      revealIntervalRef.current = null;
    }
  }, []);

  const startHiding = useCallback(() => {
    if (hideIntervalRef.current || hideTimeoutRef.current) return;

    hideTimeoutRef.current = setTimeout(() => {
      handleHide(settings.wordsPerStep);
      hideIntervalRef.current = setInterval(() => {
        handleHide(settings.wordsPerStep);
      }, 150);
      hideTimeoutRef.current = null;
    }, 300);
  }, [handleHide, settings.wordsPerStep]);

  const stopHiding = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    if (hideIntervalRef.current) {
      clearInterval(hideIntervalRef.current);
      hideIntervalRef.current = null;
    }
  }, []);

  // Cleanup intervals and timeouts on unmount
  useEffect(() => {
    return () => {
      stopRevealing();
      stopHiding();
    };
  }, [stopRevealing, stopHiding]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isEditorOpen || isSettingsOpen) return;
      
      if (e.key === settings.keyNext) {
        handleReveal(settings.wordsPerStep);
      } else if (e.key === settings.keyPrev) {
        handleHide(settings.wordsPerStep);
      } else if (e.key === 'r') {
        handleResetProgress();
      } else if (e.key === 's') {
        handleShuffle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings, isEditorOpen, isSettingsOpen, handleReveal, handleHide, handleResetProgress, handleShuffle]);

  const remainingVisibleCount = session.chunks
    .slice(session.currentIndex)
    .filter(c => !/^\s+$/.test(c.text)).length;

  return (
    <div className="app">
      <Header 
        settings={settings}
        session={session}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenEditor={() => setIsEditorOpen(true)}
        isEditorOpen={isEditorOpen}
      />

      <main className="app-main">
        <StudyArea 
          session={session}
          settings={settings}
          onToggleHighlight={handleToggleHighlight}
          onReveal={handleReveal}
          onHide={handleHide}
        />
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          
          {/* LEFT: BACK BUTTON */}
          <button 
            onClick={() => handleHide(settings.wordsPerStep)}
            onMouseDown={startHiding}
            onMouseUp={stopHiding}
            onMouseLeave={stopHiding}
            onTouchStart={startHiding}
            onTouchEnd={stopHiding}
            onTouchCancel={stopHiding}
            className="footer-button"
            aria-label="Previous Word"
          >
            <Icons.Back className="footer-button-icon" />
            <span className="footer-button-text">Back</span>
          </button>

          {/* CENTER: STATS */}
          <div className="footer-stats">
            <div className="footer-stat-item">
              <span className="footer-stat-dot indigo"></span>
              <span className="footer-stat-text">Time: {formatTime(elapsedTime)}</span>
            </div>
            <div className="footer-stat-item hidden xs:flex">
              <span className="footer-stat-dot emerald"></span>
              <span className="footer-stat-text">Mode: {settings.revealMode}</span>
            </div>
            <div className="footer-stat-item">
              <span className="footer-stat-dot amber"></span>
              <span className="footer-stat-text">Left: {remainingVisibleCount}</span>
            </div>
          </div>

          {/* RIGHT: NEXT BUTTON */}
          <button 
            onClick={() => handleReveal(settings.wordsPerStep)}
            onMouseDown={startRevealing}
            onMouseUp={stopRevealing}
            onMouseLeave={stopRevealing}
            onTouchStart={startRevealing}
            onTouchEnd={stopRevealing}
            onTouchCancel={stopRevealing}
            className="footer-button"
            aria-label="Next Word"
          >
            <span className="footer-button-text">Next</span>
            <Icons.Next className="footer-button-icon" />
          </button>
        </div>
      </footer>

      {isEditorOpen && (
        <Editor 
          initialText={session.originalText}
          onSave={handleUpdateText}
          onCancel={() => setIsEditorOpen(false)}
        />
      )}

      {isSettingsOpen && (
        <SettingsPanel 
          settings={settings}
          onUpdate={(updates) => setSettings(prev => ({ ...prev, ...updates }))}
          onClose={() => setIsSettingsOpen(false)}
          onResetProgress={handleResetProgress}
        />
      )}
    </div>
  );
};

export default App;
