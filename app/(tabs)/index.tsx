import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MACHINE_OPTIONS } from '@/app/machine/config';
import { useMachine } from '@/app/machine/machine-context';
import type { MachineId } from '@/app/types/machine';

function MachineIllustration({ machineId }: { machineId: MachineId }) {
  if (machineId === 'slushi-max') {
    return (
      <View style={styles.maxVisualShell}>
        <View style={styles.maxBody}>
          <View style={styles.maxTop} />
          <View style={styles.maxWindow}>
            <View style={styles.maxIceCube} />
            <View style={styles.maxIceCubeSmall} />
          </View>
          <View style={styles.maxFooter} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.slushiVisualShell}>
      <View style={styles.slushiBody}>
        <View style={styles.slushiLid} />
        <View style={styles.slushiTank}>
          <View style={styles.slushiWave} />
        </View>
        <View style={styles.slushiTap} />
      </View>
    </View>
  );
}

export default function IndexScreen() {
  const { selectedMachineId, setSelectedMachineId } = useMachine();

  const handleMachineSelect = (machineId: MachineId) => {
    setSelectedMachineId(machineId);
    router.push('/(tabs)/explore');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          🍧 Choisir votre machine
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Sélectionnez une Ninja Slushi pour adapter automatiquement les proportions.
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {MACHINE_OPTIONS.map((machine) => {
          const isSelected = machine.id === selectedMachineId;

          return (
            <Pressable
              key={machine.id}
              style={[styles.machineCard, isSelected && styles.machineCardSelected]}
              onPress={() => handleMachineSelect(machine.id)}
            >
              <View style={styles.cardTopRow}>
                <ThemedText type="subtitle" style={styles.machineName}>
                  {machine.name}
                </ThemedText>
                {isSelected ? (
                  <View style={styles.selectedPill}>
                    <ThemedText style={styles.selectedPillText}>Active</ThemedText>
                  </View>
                ) : null}
              </View>

              <MachineIllustration machineId={machine.id} />

              <View style={styles.machineMetaRow}>
                <ThemedText style={styles.machineMeta}>Capacité: {machine.capacityLiters}L</ThemedText>
                <ThemedText style={styles.machineEmoji}>{machine.emoji}</ThemedText>
              </View>

              <View style={styles.chooseButton}>
                <ThemedText style={styles.chooseButtonText}>Choisir et voir les recettes</ThemedText>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    color: '#8B5CF6',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  machineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  machineCardSelected: {
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  machineName: {
    color: '#1C1C1E',
  },
  selectedPill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  selectedPillText: {
    color: '#6D28D9',
    fontSize: 12,
    fontWeight: '700',
  },
  slushiVisualShell: {
    height: 120,
    borderRadius: 14,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  slushiBody: {
    width: 96,
    alignItems: 'center',
  },
  slushiLid: {
    width: 86,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#B794F4',
    marginBottom: 4,
  },
  slushiTank: {
    width: 86,
    height: 62,
    borderRadius: 12,
    backgroundColor: '#E9D5FF',
    borderWidth: 2,
    borderColor: '#C4B5FD',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  slushiWave: {
    height: 24,
    backgroundColor: '#A78BFA',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 14,
  },
  slushiTap: {
    marginTop: 6,
    width: 30,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#A78BFA',
  },
  maxVisualShell: {
    height: 120,
    borderRadius: 14,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  maxBody: {
    width: 118,
    alignItems: 'center',
  },
  maxTop: {
    width: 104,
    height: 12,
    borderRadius: 8,
    backgroundColor: '#818CF8',
    marginBottom: 4,
  },
  maxWindow: {
    width: 104,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#C7D2FE',
    borderWidth: 2,
    borderColor: '#A5B4FC',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  maxIceCube: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#A5B4FC',
    transform: [{ rotate: '16deg' }],
  },
  maxIceCubeSmall: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#E0E7FF',
    borderWidth: 2,
    borderColor: '#A5B4FC',
    transform: [{ rotate: '-12deg' }],
  },
  maxFooter: {
    marginTop: 6,
    width: 56,
    height: 14,
    borderRadius: 8,
    backgroundColor: '#818CF8',
  },
  machineMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  machineMeta: {
    fontSize: 14,
    color: '#8E8E93',
  },
  machineEmoji: {
    fontSize: 20,
  },
  chooseButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  chooseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
