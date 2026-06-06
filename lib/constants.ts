export const CASSETTE_COLORS = [
  { id: 'black',    label: 'Midnight',  hex: '#1a1a1a' },
  { id: 'cream',    label: 'Cream',     hex: '#f5f0e8' },
  { id: 'maroon',   label: 'Maroon',    hex: '#8B2635' },
  { id: 'navy',     label: 'Navy',      hex: '#1B3A6B' },
  { id: 'sage',     label: 'Sage',      hex: '#4A7C59' },
  { id: 'lavender', label: 'Lavender',  hex: '#7B6FA0' },
] as const;

export type CassetteColorId = typeof CASSETTE_COLORS[number]['id'];

export const STICKER_TYPES = [
  { id: 'stars',    label: '⭐ Stars' },
  { id: 'bow',      label: '🎀 Bow' },
  { id: 'flowers',  label: '🌸 Flowers' },
  { id: 'sparkles', label: '💫 Sparkles' },
] as const;

export type StickerTypeId = typeof STICKER_TYPES[number]['id'];

/** Pastel background for gift view based on cassette color */
export const PASTEL_MAP: Record<CassetteColorId, string> = {
  black:    '#d4d4d4',
  cream:    '#faf5e4',
  maroon:   '#f5d0d5',
  navy:     '#c8d9f0',
  sage:     '#c8e6d0',
  lavender: '#e0d8f0',
};

export const WORKER_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_URL ?? 'https://mixtape-worker.aldoramadhan16.workers.dev';

export const MAX_SONGS = 4;
export const MAX_NOTE_CHARS = 280;
