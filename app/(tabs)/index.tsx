import { Image, Pressable, StyleSheet, View } from 'react-native';
import { withHaptics, getMarkedPressStyle } from '@/app/utils/press-feedback';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MACHINE_OPTIONS } from '@/app/machine/config';
import { useLanguage } from '@/app/language/language-context';
import { useMachine } from '@/app/machine/machine-context';
import { useTheme } from '@/app/theme/theme-context';
import type { MachineId } from '@/app/types/machine';

type MachineModelBadge = {
  label: string;
};

const MACHINE_IMAGES: Record<MachineId, { light: any; dark: any }> = {
  slushi: {
    light: require('@/assets/images/ninja-slushi-fs301eu.jpg'),
    dark: require('@/assets/images/ninja-slushi-fs301eu-dark.jpg'),
  },
  'slushi-max': {
    light: require('@/assets/images/ninja-slushi-max-fs605eubr.jpg'),
    dark: require('@/assets/images/ninja-slushi-max-fs605eubr-dark.jpg'),
  },
};

function MachineIllustration({ machineId, isDark }: { machineId: MachineId; isDark: boolean }) {
  return (
    <View
      style={[
        styles.machineImageFrame,
        {
          backgroundColor: isDark ? 'rgba(8, 13, 24, 0.64)' : 'rgba(241, 245, 249, 0.78)',
          borderColor: isDark ? 'rgba(148, 163, 184, 0.24)' : 'rgba(148, 163, 184, 0.28)',
          shadowColor: isDark ? '#1D1F2A' : '#334155',
          shadowOpacity: isDark ? 0.35 : 0.12,
          shadowRadius: isDark ? 12 : 6,
        },
      ]}
    >
      <Image
        source={isDark ? MACHINE_IMAGES[machineId].dark : MACHINE_IMAGES[machineId].light}
        style={styles.machineImage}
        resizeMode="cover"
      />
      <View style={[styles.machineImageOverlay, { backgroundColor: isDark ? 'rgba(11, 18, 36, 0.28)' : 'rgba(15, 23, 42, 0.18)' }]} />
      <View style={[styles.machineImageEdge, { backgroundColor: isDark ? 'rgba(0, 0, 0, 0.18)' : 'rgba(15, 23, 42, 0.12)' }]} />
      <View
        style={[
          styles.machineImageEdgeBottom,
          {
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(15, 23, 42, 0.14)',
            height: isDark ? 48 : 36,
          },
        ]}
      />
    </View>
  );
}

export default function IndexScreen() {
  const { setSelectedMachineId, isMachineAllowed } = useMachine();
  const { colors, resolvedTheme } = useTheme();
  const { t } = useLanguage();

  const modelMeta: Record<MachineId, MachineModelBadge> = {
    slushi: {
      label: t('homeMachineStandardLabel'),
    },
    'slushi-max': {
      label: t('homeMachineMaxLabel'),
    },
  };

  const machineDescriptions: Record<MachineId, string> = {
    slushi: t('homeMachineStandardDesc'),
    'slushi-max': t('homeMachineMaxDesc'),
  };

  const isDark = resolvedTheme === 'dark';

  const handleMachineSelect = (machineId: MachineId) => {
    setSelectedMachineId(machineId);
    router.push('/(tabs)/explore');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.hero,
            {
              backgroundColor: 'transparent',
              shadowColor: isDark ? '#5B6FFF' : '#A78BFA',
              borderColor: isDark ? '#28324A' : '#E7DBFF',
            },
          ]}
        >
          <View
            style={[
              styles.heroFrame,
              {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(255, 255, 255, 0.55)',
              },
            ]}
          />
          <View style={styles.heroTextContainer}>
            <ThemedText
              type="title"
              style={[styles.heroTitle, { color: isDark ? '#F8FAFF' : '#1F2937' }]}
              numberOfLines={1}
            >
              {t('homeTitle')}
            </ThemedText>
            <ThemedText
              style={[styles.heroSubtitle, { color: isDark ? '#D1D7E8' : '#4E3E6A' }]}
              numberOfLines={2}
            >
              {t('homeSubtitle')}
            </ThemedText>
            <View style={[styles.heroAccent, { backgroundColor: colors.primary }]} />
          </View>

          <View
            style={[
              styles.heroImageWrap,
              {
                backgroundColor: isDark ? 'rgba(11, 18, 36, 0.32)' : 'rgba(255, 255, 255, 0.22)',
              },
            ]}
          >
            <Image
              source={isDark ? require('@/assets/images/hero-dark.jpg') : require('@/assets/images/hero-light.jpg')}
              style={[styles.heroImage, isDark && { opacity: 0.78 }]}
              resizeMode="cover"
            />
            <View
              style={[
                styles.heroImageTopFade,
                {
                  backgroundColor: isDark
                    ? 'rgba(11, 18, 36, 0.22)'
                    : 'rgba(255, 255, 255, 0.10)',
                },
              ]}
            />
            <View
              style={[
                styles.heroImageFade,
                {
                  backgroundColor: isDark
                    ? 'rgba(11, 18, 36, 0.30)'
                    : 'rgba(255, 255, 255, 0.06)',
                },
              ]}
            />
            <View
              style={
                [
                  styles.heroImageFadeBottom,
                  {
                    backgroundColor: isDark
                      ? 'rgba(11, 18, 36, 0.5)'
                      : 'rgba(255, 255, 255, 0.06)',
                  },
                ]
              }
            />
          </View>
        </View>

        <View style={styles.content}>
          {MACHINE_OPTIONS.map((machine) => {
            const isAllowed = isMachineAllowed(machine.id);
            const meta = modelMeta[machine.id];
            const description = machineDescriptions[machine.id];
            const hasLargeCapacity = machine.id === 'slushi-max';

            return (
              <Pressable
                key={machine.id}
                android_ripple={{ color: isDark ? 'rgba(216,204,255,0.28)' : 'rgba(109,40,217,0.2)' }}
                style={({ pressed }) => [
                  styles.machineCard,
                  {
                    backgroundColor: isDark ? '#111A2A' : colors.surface,
                    borderColor: isDark ? 'rgba(120, 128, 150, 0.2)' : 'rgba(120, 128, 150, 0.18)',
                    shadowColor: colors.shadow,
                  },
                  pressed && isAllowed && [styles.machineCardPressed, getMarkedPressStyle(true, { scale: 0.985, opacity: 0.92 })],
                  !isAllowed && { opacity: 0.45 },
                ]}
                disabled={!isAllowed}
                onPress={() => {
                  if (isAllowed) {
                    withHaptics(() => handleMachineSelect(machine.id))();
                  }
                }}
              >
                <View style={styles.cardInner}>
                  <View style={styles.cardTextColumn}>
                    <View>
                      <ThemedText
                        type="subtitle"
                        style={[styles.machineName, { color: isDark ? '#F8FAFF' : colors.text }]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        ellipsizeMode="tail"
                        minimumFontScale={0.72}
                        allowFontScaling={false}
                      >
                        {machine.name}
                      </ThemedText>
                      <View
                        style={[
                          styles.modelBadge,
                          {
                            backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.14)',
                            borderColor: isDark ? 'rgba(226, 232, 253, 0.55)' : 'rgba(139, 92, 246, 0.32)',
                          },
                        ]}
                      >
                        <ThemedText style={[styles.modelBadgeText, { color: isDark ? '#E8EAFD' : '#4C1D95' }]}>
                          {`${t('homeModelPrefix')} ${meta.label}`}
                        </ThemedText>
                      </View>
                    </View>

                    {hasLargeCapacity ? (
                      <View style={styles.badgeRow}>
                        <View
                          style={[
                            styles.auxBadge,
                            {
                              backgroundColor: isDark ? 'rgba(139, 92, 246, 0.18)' : 'rgba(139, 92, 246, 0.12)',
                              borderColor: isDark ? 'rgba(192, 201, 217, 0.68)' : 'rgba(139, 92, 246, 0.36)',
                            },
                          ]}
                        >
                          <ThemedText style={[styles.auxBadgeText, { color: isDark ? '#E8EAFD' : '#4C1D95' }]}>
                            {t('homeLargeCapacityLabel')}
                          </ThemedText>
                        </View>
                      </View>
                    ) : null}

                    <View style={styles.machineDescContainer}>
                      <ThemedText numberOfLines={3} style={[styles.machineDesc, { color: isDark ? '#A3AED2' : colors.textMuted }]}>
                        {description}
                      </ThemedText>
                    </View>

                    <View style={styles.infoRow}>
                      <ThemedText style={[styles.capacityLabel, { color: isDark ? '#8B9AB8' : colors.textMuted }]}>
                        {t('homeCapacityLabel')}
                      </ThemedText>
                      <ThemedText style={[styles.capacityValue, { color: isDark ? '#F8FAFF' : colors.text }]}>
                        {`${machine.capacityLiters.toFixed(2)}L`
                        }
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.imageWrapper}>
                    <MachineIllustration machineId={machine.id} isDark={isDark} />
                  </View>
                </View>

                <View style={styles.machineFooter}>
                  <View style={[styles.chooseButton, { backgroundColor: colors.primary, borderColor: isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(120, 128, 150, 0.24)' }]}>
                    <ThemedText style={[styles.chooseButtonText, { color: colors.primaryText }]}>{t('homeChooseButton')}</ThemedText>
                  </View>
                </View>

                <View style={[styles.cardDecorativeDot, { backgroundColor: 'rgba(167, 139, 250, 0.18)' }]} />
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
    paddingTop: 8,
    paddingBottom: 12,
  },
  hero: {
    marginHorizontal: 14,
    marginBottom: 14,
    borderRadius: 24,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 7,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 10,
    position: 'relative',
  },
  heroFrame: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderRadius: 20,
    borderWidth: 1,
    pointerEvents: 'none',
  },
  heroTextContainer: {
    flex: 1,
    gap: 8,
    zIndex: 1,
    maxWidth: '63%',
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: 0.12,
    marginBottom: -2,
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.95,
  },
  heroAccent: {
    width: 54,
    height: 4,
    borderRadius: 999,
    marginTop: 2,
  },
  heroImageWrap: {
    width: 96,
    height: 116,
    borderRadius: 16,
    borderWidth: 0,
    borderColor: 'transparent',
    overflow: 'hidden',
    backgroundColor: 'transparent',
    zIndex: 1,
    marginVertical: -2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroImage: {
    width: 92,
    height: 92,
    borderRadius: 14,
    opacity: 0.9,
  },
  heroImageTopFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 24,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    pointerEvents: 'none',
  },
  heroImageFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    pointerEvents: 'none',
  },
  heroImageFadeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 24,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    pointerEvents: 'none',
  },
  content: {
    paddingHorizontal: 14,
    gap: 12,
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  machineCard: {
    borderRadius: 22,
    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    backgroundColor: '#111A2A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
    position: 'relative',
    overflow: 'hidden',
  },

  machineCardPressed: {
    transform: [{ scale: 0.985 }],
    shadowOpacity: 0.16,
  },
  cardInner: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'stretch',
    minHeight: 172,
  },
  cardTextColumn: {
    flex: 1,
    gap: 6,
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  machineName: {
    marginBottom: 5,
    fontSize: 20,
    color: '#F8FAFF',
    fontWeight: '700',
    letterSpacing: 0.1,
    width: '100%',
  },
  modelBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 4,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 253, 0.55)',
    marginBottom: 4,
  },
  modelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: '#E8EAFD',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 2,
  },
  auxBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(192, 201, 217, 0.68)',
    backgroundColor: 'rgba(139, 92, 246, 0.18)',
  },
  auxBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.1,
    color: '#E8EAFD',
    textTransform: 'uppercase',
  },
  machineDescContainer: {
    marginTop: 0,
  },
  machineDesc: {
    fontSize: 11,
    lineHeight: 15,
    color: '#A3AED2',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 7,
  },
  capacityLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B9AB8',
    textTransform: 'uppercase',
    letterSpacing: 0.35,
  },
  capacityValue: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.1,
    color: '#F8FAFF',
  },
  imageWrapper: {
    width: '50%',
    maxWidth: '52%',
    position: 'relative',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  machineImageFrame: {
    width: '100%',
    height: 176,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(8, 13, 24, 0.64)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.24)',
    shadowColor: '#1D1F2A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  machineImage: {
    width: '100%',
    height: 176,
  },
  machineImageOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 18,
    backgroundColor: 'rgba(11, 18, 36, 0.28)',
  },
  machineImageEdge: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.18)',
  },
  machineImageEdgeBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 42,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  machineFooter: {
    marginTop: 12,
  },
  chooseButton: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  chooseButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.1,
    color: '#FFF',
  },
  cardDecorativeDot: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 20,
    right: 12,
    bottom: 14,
    opacity: 0.85,
  },
});
