import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <ThemedText type="title" style={[styles.title, { color: colors.primary }]}> 
          {t('homeTitle')}
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textMuted }]}> 
          {t('homeSubtitle')}
        </ThemedText>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {MACHINE_OPTIONS.map((machine) => {
          const isSelected = machine.id === selectedMachineId;

          return (
            <Pressable
              key={machine.id}
              style={[
                styles.machineCard,
                { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow },
                isSelected && { borderColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.25 },
              ]}
              onPress={() => handleMachineSelect(machine.id)}
            >
              <View style={styles.cardTopRow}>
                <ThemedText type="subtitle" style={styles.machineName}>
                  {machine.name}
                </ThemedText>
                {isSelected ? (
                  <View style={[styles.selectedPill, { backgroundColor: resolvedTheme === 'dark' ? '#2E2446' : '#EDE9FE' }]}>
                    <ThemedText style={[styles.selectedPillText, { color: colors.primary }]}>{t('homeSelectedMachine')}</ThemedText>
                  </View>
                ) : null}
              </View>

              <MachineIllustration machineId={machine.id} />

              <View style={styles.machineMetaRow}>
                <ThemedText style={[styles.machineMeta, { color: colors.textMuted }]}>{t('homeCapacityLabel')}: {machine.capacityLiters}L</ThemedText>
                <ThemedText style={styles.machineEmoji}>{machine.emoji}</ThemedText>
              </View>

              <View style={[styles.chooseButton, { backgroundColor: colors.primary }]}>
                <ThemedText style={[styles.chooseButtonText, { color: colors.primaryText }]}>{t('homeChooseButton')}</ThemedText>
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
    gap: 12,
  },
  machineCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  machineCardSelected: {
    borderWidth: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  machineName: {
    lineHeight: 28,
  },
  selectedPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  selectedPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  machineImage: {
    width: '100%',
    height: 180,
    marginBottom: 12,
  },
  machineMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  machineMeta: {
    fontSize: 14,
  },
  machineEmoji: {
    fontSize: 20,
  },
  chooseButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  chooseButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
