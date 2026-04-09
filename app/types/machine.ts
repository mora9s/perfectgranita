export type MachineId = 'slushi' | 'slushi-max';

export interface Machine {
  id: MachineId;
  name: string;
  shortName: string;
  capacityLiters: number;
  emoji: string;
}
