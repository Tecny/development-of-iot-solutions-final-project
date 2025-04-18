export const DISTRICTS = [
  'San_Miguel',
  'San_Borja',
  'San_Isidro',
  'Surco',
  'Magdalena',
  'Pueblo_Libre',
  'Miraflores',
  'Barranco',
  'La_Molina',
  'Jesus_Maria',
  'Lince',
  'Cercado_de_Lima',
  'Chorrillos'
];

export const GAMEMODE_OPTIONS = [
  { label: 'Fútbol 5', value: 'FUTBOL_5', sportId: 1 },
  { label: 'Fútbol 7', value: 'FUTBOL_7', sportId: 1 },
  { label: 'Fútbol 8', value: 'FUTBOL_8', sportId: 1 },
  { label: 'Fútbol 11', value: 'FUTBOL_11', sportId: 1 },
  { label: 'Billar 3', value: 'BILLAR_3', sportId: 2 }
];

export const gamemodesMap: Record<number, string[]> = GAMEMODE_OPTIONS.reduce((map, option) => {
  if (!map[option.sportId]) {
    map[option.sportId] = [];
  }
  map[option.sportId].push(option.value);
  return map;
}, {} as Record<number, string[]>);

export const gamemodeMaxPlayersMap: Record<string, number> = {
  FUTBOL_5: 10,
  FUTBOL_7: 14,
  FUTBOL_8: 16,
  FUTBOL_11: 22,
  BILLAR_3: 3
}
