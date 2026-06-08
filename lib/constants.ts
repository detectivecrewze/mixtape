export const CASSETTE_COLORS = [
  { id: 'blue',   label: 'Biru Muda', hex: '#A2C4C9' },
  { id: 'yellow', label: 'Kuning',    hex: '#F4D35E' },
  { id: 'green',  label: 'Hijau',     hex: '#8AB0AB' },
  { id: 'red',    label: 'Merah',     hex: '#E07A5F' },
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
  blue:   '#c8d9f0',
  yellow: '#fdf6cc',
  green:  '#c8e6d0',
  red:    '#f5d0d5',
};

export const WORKER_BASE_URL =
  process.env.NEXT_PUBLIC_WORKER_URL ?? 'https://mixtape-worker.aldoramadhan16.workers.dev';

export const MAX_SONGS = 4;
export const MAX_NOTE_CHARS = 280;
