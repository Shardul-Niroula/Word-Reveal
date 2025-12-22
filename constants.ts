
import { RevealMode, Theme, Settings } from './types';

export const DEFAULT_SETTINGS: Settings = {
  revealMode: RevealMode.WORD,
  wordsPerStep: 1,
  fontSize: 18,
  theme: Theme.LIGHT,
  keyNext: 'ArrowRight',
  keyPrev: 'ArrowLeft',
  autoSave: true,
  highlightMode: false,
};

export const DEMO_TEXT = `WordReveal: The Ultimate Study Assistant

To start, simply paste your study material into the editor. Use the arrow keys (or the on-screen buttons on mobile) to reveal text bit by bit. This technique, known as active recall, is highly effective for memorization.

Features included in this tool:
1. Dynamic Reveal Modes: Switch between word, sentence, or line reveal.
2. Customization: Adjust font size, themes, and key bindings.
3. Progress Tracking: See how much you've covered in real-time.
4. Highlight Mode: Mark critical parts to keep them visible at all times.
5. Mobile Optimized: Swipe or tap to reveal on the go.

Start practicing today and watch your retention skyrocket!`;

export const STORAGE_KEY = 'wordreveal_app_state';
export const SETTINGS_KEY = 'wordreveal_settings';
