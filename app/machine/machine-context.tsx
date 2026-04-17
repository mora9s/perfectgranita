import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_MACHINE_ID, MACHINES } from '@/app/machine/config';
import type { Machine, MachineId, MachinePreferenceMode } from '@/app/types/machine';

interface MachineContextValue {
  selectedMachineId: MachineId;
  selectedMachine: Machine;
  machinePreferenceMode: MachinePreferenceMode;
  availableMachines: Machine[];
  isMachineAllowed: (machineId: MachineId) => boolean;
  setSelectedMachineId: (machineId: MachineId) => void;
  setMachinePreferenceMode: (mode: MachinePreferenceMode) => void;
}

const MachineContext = createContext<MachineContextValue | undefined>(undefined);

function getAllowedMachineIds(mode: MachinePreferenceMode): MachineId[] {
  if (mode === 'both') {
    return ['slushi', 'slushi-max'];
  }

  return [mode];
}

export function MachineProvider({ children }: PropsWithChildren) {
  const [selectedMachineId, setSelectedMachineId] = useState<MachineId>(DEFAULT_MACHINE_ID);
  const [machinePreferenceMode, setMachinePreferenceMode] = useState<MachinePreferenceMode>('both');

  const allowedMachineIds = useMemo(
    () => getAllowedMachineIds(machinePreferenceMode),
    [machinePreferenceMode]
  );

  useEffect(() => {
    if (!allowedMachineIds.includes(selectedMachineId)) {
      setSelectedMachineId(allowedMachineIds[0]);
    }
  }, [allowedMachineIds, selectedMachineId]);

  const setSelectedMachineIdForMode = (machineId: MachineId) => {
    if (allowedMachineIds.includes(machineId)) {
      setSelectedMachineId(machineId);
    }
  };

  const value = useMemo(
    () => ({
      selectedMachineId,
      selectedMachine: MACHINES[selectedMachineId],
      machinePreferenceMode,
      availableMachines: allowedMachineIds.map((machineId) => MACHINES[machineId]),
      isMachineAllowed: (machineId: MachineId) => allowedMachineIds.includes(machineId),
      setSelectedMachineId: setSelectedMachineIdForMode,
      setMachinePreferenceMode,
    }),
    [selectedMachineId, machinePreferenceMode, allowedMachineIds]
  );

  return <MachineContext.Provider value={value}>{children}</MachineContext.Provider>;
}

export function useMachine() {
  const context = useContext(MachineContext);

  if (!context) {
    throw new Error('useMachine must be used within MachineProvider');
  }

  return context;
}
