import { useMemo, useState } from 'react';
import { Alert, Linking, Modal, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMachine } from '@/app/machine/machine-context';
import { useLanguage, type AppLanguage } from '@/app/language/language-context';
import { useTheme, type ThemePreference } from '@/app/theme/theme-context';
import { withHaptics } from '@/app/utils/press-feedback';
import type { MachinePreferenceMode } from '@/app/types/machine';

const DONATION_URL = 'https://www.paypal.com/donate?hosted_button_id=YOUR_PAYPAL_HOSTED_BUTTON_ID';

export default function SettingsScreen() {
  const { colors, themePreference, setThemePreference, resolvedTheme } = useTheme();
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const { machinePreferenceMode, setMachinePreferenceMode, setSelectedMachineId } = useMachine();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const selectedLanguageLabel = useMemo(() => {
    return availableLanguages.find((option) => option.value === language)?.label ?? language.toUpperCase();
  }, [availableLanguages, language]);

  const selectedThemeLabel = resolvedTheme === 'dark' ? t('activeThemeDark') : t('activeThemeLight');

  const machineModeOptions = useMemo<Array<{ value: MachinePreferenceMode; label: string; icon: string }>>(
    () => [
      { value: 'both', label: t('machineModeBoth'), icon: '⚖️' },
      { value: 'slushi', label: 'Ninja Slushi', icon: '🥤' },
      { value: 'slushi-max', label: 'Ninja Slushi Max', icon: '🧊' },
    ],
    [t]
  );

  const handleMachineModeSelect = (value: MachinePreferenceMode) => {
    setMachinePreferenceMode(value);

    if (value !== 'both') {
      setSelectedMachineId(value);
    }
  };

  const hasLanguageOptions = availableLanguages.length > 0;

  const handleLanguageSelect = (value: AppLanguage) => {
    setLanguage(value);
    setIsLanguageMenuOpen(false);
  };


  const handleDonatePress = async () => {
    const canOpen = await Linking.canOpenURL(DONATION_URL);

    if (!canOpen) {
      Alert.alert(t('donationOpenErrorTitle'), t('donationOpenErrorMessage'));
      return;
    }

    await Linking.openURL(DONATION_URL);
  };

  const closeLanguageMenu = () => {
    setIsLanguageMenuOpen(false);
  };

  const themeOptions: Array<{ value: ThemePreference; label: string }> = [
    { value: 'light', label: t('themeLight') },
    { value: 'dark', label: t('themeDark') },
    { value: 'system', label: t('themeSystem') },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <ThemedText type="title" style={styles.headerTitle}>
          {t('settingsTitle')}
        </ThemedText>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          {'🎨 '}
          {t('appearanceSectionTitle')}
        </ThemedText>
        <View style={[styles.segmentedControl, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
          {themeOptions.map((option) => {
            const selected = themePreference === option.value;

            return (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.segmentButton,
                  { backgroundColor: colors.surfaceSoft, borderColor: colors.border },
                  selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                  pressed && { transform: [{ scale: 0.92 }, { translateY: 1 }], opacity: 0.84, borderWidth: 1.2, shadowOpacity: 0.2 },
                ]}
                onPress={withHaptics(() => setThemePreference(option.value))}
              >
                <ThemedText
                  style={[styles.segmentText, { color: selected ? colors.primaryText : colors.textMuted }]}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ThemedText style={[styles.helperLabel, { color: colors.textMuted }]}>
          {t('activeThemeLabel')}: {selectedThemeLabel}
        </ThemedText>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          {'🌐 '}
          {t('languageSectionTitle')}
        </ThemedText>
        <Pressable
          onPress={withHaptics(() => setIsLanguageMenuOpen(true))}
          disabled={!hasLanguageOptions}
          style={({ pressed }) => [
            styles.pickerRow,
            { borderColor: colors.border, backgroundColor: colors.surfaceSoft },
            pressed && { transform: [{ scale: 0.92 }, { translateY: 1 }], opacity: 0.85, borderWidth: 1.2, shadowOpacity: 0.2 },
          ]}
          android_ripple={{ color: colors.textMuted }}
          hitSlop={6}
        >
          <ThemedText style={[styles.summaryText, { color: colors.text }]}>
            {selectedLanguageLabel}
          </ThemedText>
          <ThemedText style={[styles.chevron, { color: colors.textMuted }]}>▸</ThemedText>
        </Pressable>

        <ThemedText style={[styles.helperLabel, { color: colors.textMuted }]}>
          {t('currentLanguageLabel')}: {selectedLanguageLabel}
        </ThemedText>

        <Modal
          animationType="fade"
          transparent
          visible={isLanguageMenuOpen}
          onRequestClose={closeLanguageMenu}
        >
          <View style={styles.languagePanelBackdrop}>
            <Pressable
            style={[styles.languagePanelBackdropPress, { backgroundColor: '#00000040' }]}
            onPress={withHaptics(closeLanguageMenu)}
            />
            <View
              style={[
                styles.languagePanel,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <ThemedText type="defaultSemiBold" style={[styles.languagePanelTitle, { color: colors.text }]}>
                {t('languagePickerTitle')}
              </ThemedText>

              {availableLanguages.map((option) => {
                const selected = language === option.value;

                return (
                  <Pressable
                    key={option.value}
                    style={({ pressed }) => [
                      styles.languagePanelOption,
                      {
                        backgroundColor: selected ? colors.primary + '16' : colors.surface,
                        borderColor: selected ? colors.primary : colors.border,
                      },
                      pressed && { transform: [{ scale: 0.92 }, { translateY: 1 }], opacity: 0.85, borderWidth: 1.2, shadowOpacity: 0.2 },
                    ]}
                    onPress={withHaptics(() => handleLanguageSelect(option.value))}
                    android_ripple={{ color: colors.textMuted }}
                  >
                    <ThemedText style={[styles.languagePanelOptionText, { color: selected ? colors.primary : colors.text }]}>
                      {option.label}
                    </ThemedText>
                    {selected ? <ThemedText style={[styles.languagePanelOptionCheck, { color: colors.primary }]}>✓</ThemedText> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Modal>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          {t('machineSettingsTitle')}
        </ThemedText>
        <ThemedText style={[styles.sectionLabel, { color: colors.textMuted }]}>
          {t('machineDefaultLabel')}
        </ThemedText>

        <View style={[styles.machineChoiceList, { borderColor: colors.border }]}>
          {machineModeOptions.map((option) => {
            const selected = machinePreferenceMode === option.value;

            return (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.machineChoiceRow,
                  { backgroundColor: colors.surfaceSoft, borderColor: colors.border },
                  selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                  pressed && { transform: [{ scale: 0.98 }, { translateY: 1 }], opacity: 0.86, borderWidth: 1.2 },
                ]}
                onPress={withHaptics(() => handleMachineModeSelect(option.value))}
              >
                <ThemedText style={[styles.machineChoiceLabel, { color: selected ? colors.primaryText : colors.textMuted }]}>
                  {option.icon} {option.label}
                </ThemedText>
                {selected ? (
                  <ThemedText style={[styles.machineChoiceCheck, { color: colors.primaryText }]}>✓</ThemedText>
                ) : null}
              </Pressable>
            );
          })}
        </View>

      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
          {'💙 '}
          {t('donationSectionTitle')}
        </ThemedText>
        <ThemedText style={[styles.helperLabel, { color: colors.textMuted }]}>
          {t('donationDescription')}
        </ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.donateButton,
            { backgroundColor: colors.primary, borderColor: colors.primary },
            pressed && { transform: [{ scale: 0.92 }, { translateY: 1 }], opacity: 0.85, borderWidth: 1.2, shadowOpacity: 0.2 },
          ]}
          onPress={withHaptics(handleDonatePress)}
        >
          <ThemedText style={[styles.donateButtonText, { color: colors.primaryText }]}>
            {t('donationButtonLabel')}
          </ThemedText>
        </Pressable>
      </View>
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
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerTitle: {
    marginBottom: 2,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 15,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  segmentButton: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 0,
  },
  machineChoiceList: {
    gap: 6,
    marginBottom: 2,
  },
  machineChoiceRow: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    flexDirection: 'row',
  },
  machineChoiceLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  machineChoiceCheck: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 16,
  },
  helperLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
  },
  pickerRow: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
  },
  donateButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  donateButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  languagePanelBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  languagePanelBackdropPress: {
    ...StyleSheet.absoluteFillObject,
  },
  languagePanel: {
    borderRadius: 16,
    borderWidth: 1,
    width: '100%',
    padding: 12,
    gap: 8,
    zIndex: 1,
  },
  languagePanelTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  languagePanelOption: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  languagePanelOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  languagePanelOptionCheck: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 16,
  },
});
