
export enum RevealMode {
  WORD = 'word',
  SENTENCE = 'sentence',
  ROW = 'row'
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

export interface Settings {
  revealMode: RevealMode;
  wordsPerStep: number;
  fontSize: number;
  theme: Theme;
  keyNext: string;
  keyPrev: string;
  autoSave: boolean;
  highlightMode: boolean;
}

export interface Chunk {
  id: string;
  text: string;
  isRevealed: boolean;
  isHighlighted: boolean;
  originalIndex: number;
}

export interface SessionState {
  originalText: string;
  chunks: Chunk[];
  currentIndex: number;
  revealedCount: number;
  startTime: number | null;
  streak: number;
  lastPracticeDate: string | null;
}
