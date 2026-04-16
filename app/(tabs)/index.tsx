import { Image, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MACHINE_OPTIONS } from '@/app/machine/config';
import { useLanguage } from '@/app/language/language-context';
import { useMachine } from '@/app/machine/machine-context';
import { useTheme } from '@/app/theme/theme-context';
import type { MachineId } from '@/app/types/machine';

const MACHINE_IMAGES: Record<MachineId, any> = {
  slushi: require('@/assets/images/ninja-slushi-fs301eu.jpg'),
  'slushi-max': require('@/assets/images/ninja-slushi-max-fs605eubr.jpg'),
};

function MachineIllustration({ machineId }: { machineId: MachineId }) {
  return <Image source={MACHINE_IMAGES[machineId]} style={styles.machineImage} resizeMode="contain" />;
}

export default function IndexScreen() {
  const { selectedMachineId, setSelectedMachineId } = useMachine();
  const { colors, resolvedTheme } = useTheme();
  const { t } = useLanguage();

  const handleMachineSelect = (machineId: MachineId) => {
    setSelectedMachineId(machineId);
    router.push('/(tabs)/explore');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}> 
        <View style={[styles.header, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}> 
          <ThemedText type="title" style={[styles.title, { color: colors.primary }]}> 
            {t('homeTitle')}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}> 
            {t('homeSubtitle')}
          </ThemedText>
        </View>

        <View style={styles.content}>
          {MACHINE_OPTIONS.map((machine) => {
            const isSelected = machine.id === selectedMachineId;

            return (
              <Pressable
                key={machine.id}
                style={[
                  styles.machineCard,
                  { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow },
                  isSelected && {
                    borderColor: colors.primary,
                    shadowColor: colors.primary,
                    shadowOpacity: 0.25,
                  },
                ]}
                onPress={() => handleMachineSelect(machine.id)}
              >
                <View style={styles.cardTopRow}>
                  <ThemedText type="subtitle" style={styles.machineName}>
                    {machine.name}
                  </ThemedText>
                  {isSelected ? (
                    <View
                      style={[
                        styles.selectedPill,
                        {
                          backgroundColor: resolvedTheme === 'dark' ? '#2E2446' : '#EDE9FE',
                        },
                      ]}
                    >
                      <ThemedText style={[styles.selectedPillText, { color: colors.primary }]}> 
                        {t('homeSelectedMachine')}
                      </ThemedText>
                    </View>
                  ) : null}
                </View>

                <MachineIllustration machineId={machine.id} />

                <View style={styles.machineMetaRow}>
                  <ThemedText style={[styles.machineMeta, { color: colors.textMuted }]}> 
                    {t('homeCapacityLabel')}: {machine.capacityLiters}L
                  </ThemedText>
                  <ThemedText style={styles.machineEmoji}>{machine.emoji}</ThemedText>
                </View>

                <View style={[styles.chooseButton, { backgroundColor: colors.primary }]}> 
                  <ThemedText style={[styles.chooseButtonText, { color: colors.primaryText }]}> 
                    {t('homeChooseButton')}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 4,
  },
  header: {
    marginHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 0,
    gap: 10,
  },
  machineCard: {
    flex: 1,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  machineName: {
    lineHeight: 24,
  },
  selectedPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  selectedPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  machineImage: {
    width: '100%',
    height: 144,
    marginBottom: 8,
    borderRadius: 10,
  },
  machineMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  machineMeta: {
    fontSize: 13,
  },
  machineEmoji: {
    fontSize: 20,
  },
  chooseButton: {
    borderRadius: 12,
    paddingVertical: 9,
    alignItems: 'center',
  },
  chooseButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
