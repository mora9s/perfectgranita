import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';
import { DEFAULT_MACHINE_ID, MACHINES } from '@/app/machine/config';
import type { Machine, MachineId } from '@/app/types/machine';

interface MachineContextValue {
  selectedMachineId: MachineId;
  selectedMachine: Machine;
  setSelectedMachineId: (machineId: MachineId) => void;
}

const MachineContext = createContext<MachineContextValue | undefined>(undefined);

export function MachineProvider({ children }: PropsWithChildren) {
  const [selectedMachineId, setSelectedMachineId] = useState<MachineId>(DEFAULT_MACHINE_ID);

  const value = useMemo(
    () => ({
      selectedMachineId,
      selectedMachine: MACHINES[selectedMachineId],
      setSelectedMachineId,
    }),
    [selectedMachineId]
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
