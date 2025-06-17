export const SPORTS = [
  { id: 1, label: 'Futbol', value: 'FUTBOL' },
  { id: 2, label: 'Billar', value: 'BILLAR' }
];

export const GAMEMODE_OPTIONS = [
  { id: 1, label: 'Futbol 11', value: 'FUTBOL_11', sportId: 1 },
  { id: 2, label: 'Futbol 8', value: 'FUTBOL_8', sportId: 1 },
  { id: 3, label: 'Futbol 7', value: 'FUTBOL_7', sportId: 1 },
  { id: 4, label: 'Futbol 5', value: 'FUTBOL_5', sportId: 1 },
  { id: 5, label: 'Billar 3', value: 'BILLAR_3', sportId: 2 }
];

export const gamemodesMap: Record<number, string[]> = GAMEMODE_OPTIONS.reduce((map, option) => {
  if (!map[option.sportId]) {
    map[option.sportId] = [];
  }
  map[option.sportId].push(option.value);
  return map;
}, {} as Record<number, string[]>);

export const sportIdToLabelMap = Object.fromEntries(
  SPORTS.map(s => [s.id, s.label])
);

export const gamemodeIdToLabelMap = Object.fromEntries(
  GAMEMODE_OPTIONS.map(g => [g.id, g.label])
);

export const getSportIdByValue = (value: string): number | undefined =>
  SPORTS.find(s => s.value === value)?.id;

