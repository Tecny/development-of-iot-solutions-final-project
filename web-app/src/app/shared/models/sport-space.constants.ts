export const SPORTS = [
  { id: 1, label: 'Fútbol', value: 'FUTBOL' },
  { id: 2, label: 'Billar', value: 'BILLAR' }
];

export const DISTRICTS = [
  { id: 1, label: 'San Miguel', value: 'San_Miguel' },
  { id: 2, label: 'San Borja', value: 'San_Borja' },
  { id: 3, label: 'San Isidro', value: 'San_Isidro' },
  { id: 4, label: 'Surco', value: 'Surco' },
  { id: 5, label: 'Magdalena', value: 'Magdalena' },
  { id: 6, label: 'Pueblo Libre', value: 'Pueblo_Libre' },
  { id: 7, label: 'Miraflores', value: 'Miraflores' },
  { id: 8, label: 'Barranco', value: 'Barranco' },
  { id: 9, label: 'La Molina', value: 'La_Molina' },
  { id: 10, label: 'Jesús María', value: 'Jesus_Maria' },
  { id: 11, label: 'Lince', value: 'Lince' },
  { id: 12, label: 'Cercado de Lima', value: 'Cercado_de_Lima' },
  { id: 13, label: 'Chorrillos', value: 'Chorrillos' }
];

export const GAMEMODE_OPTIONS = [
  { id: 1, label: 'Fútbol 11', value: 'FUTBOL_11', sportId: 1 },
  { id: 2, label: 'Fútbol 7', value: 'FUTBOL_7', sportId: 1 },
  { id: 3, label: 'Fútbol 8', value: 'FUTBOL_8', sportId: 1 },
  { id: 4, label: 'Fútbol 5', value: 'FUTBOL_5', sportId: 1 },
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

export const districtIdToLabelMap = Object.fromEntries(
  DISTRICTS.map(d => [d.id, d.label])
);

export const gamemodeIdToLabelMap = Object.fromEntries(
  GAMEMODE_OPTIONS.map(g => [g.id, g.label])
);

export const getSportIdByValue = (value: string): number | undefined =>
  SPORTS.find(s => s.value === value)?.id;

export const getDistrictIdByValue = (value: string): number | undefined =>
  DISTRICTS.find(d => d.value === value)?.id;

