import { MACHINES } from '@/app/machine/config';
import type { MachineId } from '@/app/types/machine';
import type { Recipe } from '@/app/types/database';

const BASE_MACHINE_ID: MachineId = 'slushi';

function getScaleFactor(machineId: MachineId): number {
  return MACHINES[machineId].capacityLiters / MACHINES[BASE_MACHINE_ID].capacityLiters;
}

function formatScaledNumber(original: string, scaled: number): string {
  if (original.includes('.') || original.includes(',')) {
    return scaled.toFixed(1).replace('.', ',');
  }

  if (scaled >= 100) {
    return Math.round(scaled).toString();
  }

  return Number(scaled.toFixed(1)).toString().replace('.', ',');
}

export function scaleQuantityString(input: string | undefined | null, machineId: MachineId): string {
  if (typeof input !== 'string') {
    return '—';
  }

  if (!input.trim()) {
    return input;
  }

  const factor = getScaleFactor(machineId);
  return input.replace(/\d+(?:[.,]\d+)?/g, (match) => {
    const normalized = Number(match.replace(',', '.'));

    if (Number.isNaN(normalized)) {
      return match;
    }

    return formatScaledNumber(match, normalized * factor);
  });
}

export function scaleRecipeProportions(recipe: Recipe, machineId: MachineId): Recipe['proportions'] {
  const proportions = recipe.proportions ?? { water: '—', sugar: '—', flavor: '—' };

  return {
    water: scaleQuantityString(proportions.water, machineId),
    sugar: scaleQuantityString(proportions.sugar, machineId),
    flavor: scaleQuantityString(proportions.flavor, machineId),
  };
}
