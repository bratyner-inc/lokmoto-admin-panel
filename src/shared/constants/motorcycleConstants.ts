// Motorcycle-related constants

export const MOTORCYCLE_STATUS = {
  AVAILABLE: 'available',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
  INACTIVE: 'inactive',
} as const;

export const MOTORCYCLE_STATUS_LABELS = {
  [MOTORCYCLE_STATUS.AVAILABLE]: 'Disponível',
  [MOTORCYCLE_STATUS.RENTED]: 'Alugada',
  [MOTORCYCLE_STATUS.MAINTENANCE]: 'Em Manutenção',
  [MOTORCYCLE_STATUS.INACTIVE]: 'Inativa',
};

export const MOTORCYCLE_STATUS_COLORS = {
  [MOTORCYCLE_STATUS.AVAILABLE]: 'success',
  [MOTORCYCLE_STATUS.RENTED]: 'warning',
  [MOTORCYCLE_STATUS.MAINTENANCE]: 'info',
  [MOTORCYCLE_STATUS.INACTIVE]: 'default',
} as const;

export const ENGINE_CAPACITY_RANGES = [
  { label: 'Até 125cc', min: 0, max: 125 },
  { label: '126cc - 250cc', min: 126, max: 250 },
  { label: '251cc - 500cc', min: 251, max: 500 },
  { label: '501cc - 750cc', min: 501, max: 750 },
  { label: 'Acima de 750cc', min: 751, max: Infinity },
];

export const MOTORCYCLE_COLORS = [
  'Preto',
  'Branco',
  'Prata',
  'Vermelho',
  'Azul',
  'Verde',
  'Amarelo',
  'Laranja',
  'Cinza',
  'Outro',
];

export const POPULAR_BRANDS = [
  'Honda',
  'Yamaha',
  'Suzuki',
  'Kawasaki',
  'BMW',
  'Harley-Davidson',
  'Ducati',
  'Triumph',
  'Royal Enfield',
  'KTM',
];

