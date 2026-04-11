import type { Machine, MachineId } from '@/app/types/machine';

// Capacites utilises pour les recettes importees:
// - Ninja Slushi: 1.89L (remplissage max utile)
// - Ninja Slushi Max: 3.31L (remplissage max utile)
export const MACHINES: Record<MachineId, Machine> = {
  slushi: {
    id: 'slushi',
    name: 'Ninja Slushi',
    shortName: 'Slushi',
    capacityLiters: 1.89,
    emoji: '🥤',
  },
  'slushi-max': {
    id: 'slushi-max',
    name: 'Ninja Slushi Max',
    shortName: 'Slushi Max',
    capacityLiters: 3.31,
    emoji: '🧊',
  },
};

export const DEFAULT_MACHINE_ID: MachineId = 'slushi';

export const MACHINE_OPTIONS: Machine[] = [
  MACHINES.slushi,
  MACHINES['slushi-max'],
];
