export type MachineId = 'slushi' | 'slushi-max';
export type MachinePreferenceMode = 'slushi' | 'slushi-max' | 'both';

export interface Machine {
  id: MachineId;
  name: string;
  shortName: string;
  capacityLiters: number;
  emoji: string;
}
