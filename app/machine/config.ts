import type { Machine, MachineId } from '@/app/types/machine';

// Capacites locales plausibles produit:
// - Ninja Slushi: 2.5L (reference)
// - Ninja Slushi Max: 3.8L (cuve plus grande)
export const MACHINES: Record<MachineId, Machine> = {
  slushi: {
    id: 'slushi',
    name: 'Ninja Slushi',
    shortName: 'Slushi',
    capacityLiters: 2.5,
    emoji: '🥤',
  },
  'slushi-max': {
    id: 'slushi-max',
    name: 'Ninja Slushi Max',
    shortName: 'Slushi Max',
    capacityLiters: 3.8,
    emoji: '🧊',
  },
};

export const DEFAULT_MACHINE_ID: MachineId = 'slushi';

export const MACHINE_OPTIONS: Machine[] = [
  MACHINES.slushi,
  MACHINES['slushi-max'],
];
