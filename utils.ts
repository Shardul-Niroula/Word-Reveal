
import { RevealMode, Chunk } from './types';

export const splitTextIntoChunks = (text: string, mode: RevealMode): Chunk[] => {
  let parts: string[] = [];

  if (mode === RevealMode.WORD) {
    // Split by words and keep spaces as separate chunks
    parts = text.split(/(\s+)/);
  } else if (mode === RevealMode.SENTENCE) {
    // Split by sentence endings (periods, exclamation marks, question marks)
    // followed by whitespace, large whitespace gaps (10+ chars), or newlines
    parts = text.split(/([.!?]+\s*|\s{10,}|\n+)/);
  } else if (mode === RevealMode.ROW) {
    // Split by newlines and keep them as separate chunks
    parts = text.split(/(\n)/).filter(Boolean);
  }

  return parts
    .filter(p => p.length > 0)
    .map((p, i) => ({
      id: `chunk-${mode}-${i}`,
      text: p,
      isRevealed: false,
      isHighlighted: false,
      originalIndex: i,
    }));
};

export const formatTime = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

  return [
    hours > 0 ? String(hours).padStart(2, '0') : null,
    String(minutes).padStart(2, '0'),
    String(seconds).padStart(2, '0'),
  ]
    .filter(Boolean)
    .join(':');
};
