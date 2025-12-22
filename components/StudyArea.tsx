
import React from 'react';
import { SessionState, Settings } from '../types';
import { Icons } from './icons';

interface StudyAreaProps {
  session: SessionState;
  settings: Settings;
  onToggleHighlight: (chunkId: string) => void;
  onReveal: (count: number) => void;
  onHide: (count: number) => void;
}

const StudyArea: React.FC<StudyAreaProps> = ({ 
  session, 
  settings, 
  onToggleHighlight,
  onReveal,
  onHide
}) => {
  const { chunks } = session;

  // Unified swipe handler for both touch and mouse events
  const handlePointerStart = (e: React.PointerEvent | React.TouchEvent | React.MouseEvent) => {
    // Prevent default browser behaviors (pull-to-refresh, edge swipe navigation, etc.)
    e.preventDefault();
    
    const startX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const startY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    let isSwipeDetected = false;
    
    // Prevent all browser default behaviors during swipe
    const preventDefaults = (event: Event) => {
      event.preventDefault();
      event.stopPropagation();
    };
    
    const handlePointerMove = (moveEvent: PointerEvent | TouchEvent | MouseEvent) => {
      if (isSwipeDetected) return;
      
      // Prevent default behaviors during move as well
      preventDefaults(moveEvent);
      
      const currentX = 'touches' in moveEvent ? moveEvent.touches[0].clientX : moveEvent.clientX;
      const currentY = 'touches' in moveEvent ? moveEvent.touches[0].clientY : moveEvent.clientY;
      
      const diffX = currentX - startX;
      const diffY = currentY - startY;

      // Swipe detected - horizontal swipe with minimal vertical movement
      if (Math.abs(diffX) > 50 && Math.abs(diffY) < 30) {
        isSwipeDetected = true;
        if (diffX > 0) {
          // Swipe right - hide/reveal previous
          onHide(settings.wordsPerStep);
        } else {
          // Swipe left - reveal next
          onReveal(settings.wordsPerStep);
        }
        
        // Remove listeners after swipe detection
        cleanupListeners();
      }
    };

    const handlePointerEnd = () => {
      cleanupListeners();
    };

    const cleanupListeners = () => {
      document.removeEventListener('pointermove', handlePointerMove, { capture: true });
      document.removeEventListener('pointerup', handlePointerEnd, { capture: true });
      document.removeEventListener('touchmove', handlePointerMove, { capture: true });
      document.removeEventListener('touchend', handlePointerEnd, { capture: true });
      document.removeEventListener('mousemove', handlePointerMove, { capture: true });
      document.removeEventListener('mouseup', handlePointerEnd, { capture: true });
      // Remove document-level prevention
      document.removeEventListener('touchstart', preventDefaults, { capture: true, passive: false } as any);
      document.removeEventListener('touchmove', preventDefaults, { capture: true, passive: false } as any);
      document.removeEventListener('touchend', preventDefaults, { capture: true, passive: false } as any);
    };

    // Add document-level prevention for all touch events during swipe
    document.addEventListener('touchstart', preventDefaults, { capture: true, passive: false } as any);
    document.addEventListener('touchmove', preventDefaults, { capture: true, passive: false } as any);
    document.addEventListener('touchend', preventDefaults, { capture: true, passive: false } as any);

    // Add appropriate event listeners based on input type
    if ('pointerId' in e) {
      // Pointer events (modern browsers)
      document.addEventListener('pointermove', handlePointerMove, { capture: true, passive: false });
      document.addEventListener('pointerup', handlePointerEnd, { capture: true });
    } else if ('touches' in e) {
      // Touch events (mobile)
      document.addEventListener('touchmove', handlePointerMove, { capture: true, passive: false });
      document.addEventListener('touchend', handlePointerEnd, { capture: true });
    } else {
      // Mouse events (laptop touchpad)
      document.addEventListener('mousemove', handlePointerMove, { capture: true, passive: false });
      document.addEventListener('mouseup', handlePointerEnd, { capture: true });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handlePointerStart(e);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only handle mouse events if it's likely a touchpad (prevent accidental clicks)
    if (e.button === 0) { // Left mouse button only
      handlePointerStart(e);
    }
  };

  return (
    <div 
      className="study-area"
      onTouchStart={handleTouchStart}
      onMouseDown={handleMouseDown}
      onPointerDown={handlePointerStart}
    >
      <div 
        className="reveal-container"
        style={{ '--font-size': `${settings.fontSize}px` } as React.CSSProperties}
      >
        {session.revealedCount === 0 && chunks.length > 0 && (
          <div className="instruction-card">
            <div className="instruction-container">
              <div className="instruction-header">
                <h2 className="instruction-title">
                  Welcome to WordReveal! <Icons.Star className="inline-icon" />
                </h2>
                <p className="instruction-subtitle">
                  Your interactive study companion
                </p>
              </div>

              <div className="instruction-grid">
                <div className="instruction-item edit">
                  <div className="instruction-icon">
                    <Icons.Edit />
                  </div>
                  <div className="instruction-content">
                    <h3>Edit Content</h3>
                    <p>Click the edit button to paste your study text</p>
                  </div>
                </div>

                <div className="instruction-item settings">
                  <div className="instruction-icon">
                    <Icons.Settings />
                  </div>
                  <div className="instruction-content">
                    <h3>Customize Settings</h3>
                    <p>Adjust font size, reveal mode, and preferences</p>
                  </div>
                </div>

                <div className="instruction-item start">
                  <div className="instruction-icon">
                    <Icons.Next />
                  </div>
                  <div className="instruction-content">
                    <h3>Start Studying</h3>
                    <p>Click "Next" or swipe right to reveal words</p>
                  </div>
                </div>

                <div className="instruction-item back">
                  <div className="instruction-icon">
                    <Icons.Back />
                  </div>
                  <div className="instruction-content">
                    <h3>Navigate Back</h3>
                    <p>Click "Back" or swipe left to hide words</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {chunks.map((chunk) => {
          const isVisible = chunk.isRevealed || chunk.isHighlighted;
          const isWhitespace = /^\s+$/.test(chunk.text);
          
          // Use inline-block for hidden words to maintain consistent width, 
          // but normal inline for visible text to allow wrapping.
          return (
            <span
              key={chunk.id}
              onClick={() => settings.highlightMode && !isWhitespace && onToggleHighlight(chunk.id)}
              className={`
                reveal-transition
                ${isVisible ? 'visible-word' : (isWhitespace ? '' : 'hidden-word')}
                ${chunk.isHighlighted ? 'highlighted-word' : ''}
                ${settings.highlightMode && !isWhitespace ? 'highlight-hover' : ''}
              `}
              aria-hidden={!isVisible && !isWhitespace}
            >
              {chunk.text}
            </span>
          );
        })}
      </div>

      {chunks.length === 0 && (
        <div className="empty-state">
          <Icons.Document className="empty-state-icon" />
          <h2>No content to study</h2>
          <p>Paste some text using the editor button above</p>
        </div>
      )}
    </div>
  );
};

export default StudyArea;
