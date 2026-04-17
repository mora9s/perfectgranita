import { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useMachine } from '@/app/machine/machine-context';
import { useLanguage, type AppLanguage } from '@/app/language/language-context';
import { useTheme, type ThemePreference } from '@/app/theme/theme-context';
import type { MachinePreferenceMode } from '@/app/types/machine';

const DONATION_URL = 'https://www.paypal.com/donate?hosted_button_id=YOUR_PAYPAL_HOSTED_BUTTON_ID';

export default function SettingsScreen() {
  const { colors, themePreference, setThemePreference, resolvedTheme } = useTheme();
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const { machinePreferenceMode, setMachinePreferenceMode } = useMachine();
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  const selectedLanguageLabel = useMemo(() => {
    return availableLanguages.find((option) => option.value === language)?.label ?? language.toUpperCase();
  }, [availableLanguages, language]);

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

  const themeOptions: Array<{ value: ThemePreference; label: string }> = [
    { value: 'light', label: t('themeLight') },
    { value: 'dark', label: t('themeDark') },
    { value: 'system', label: t('themeSystem') },
  ];

  const machineModeOptions: Array<{ value: MachinePreferenceMode; label: string }> = [
    { value: 'both', label: t('machineModeBoth') },
    { value: 'slushi', label: t('machineModeSlushiOnly') },
    { value: 'slushi-max', label: t('machineModeMaxOnly') },
  ];

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}> 
        <ThemedText type="title" style={styles.headerTitle}>
          {t('settingsTitle')}
        </ThemedText>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <ThemedText type="defaultSemiBold">{t('appearanceSectionTitle')}</ThemedText>
        <View style={[styles.segmentedControl, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}> 
          {themeOptions.map((option) => {
            const selected = themePreference === option.value;

            return (
              <Pressable
                key={option.value}
                style={[
                  styles.segmentButton,
                  selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setThemePreference(option.value)}
              >
                <ThemedText
                  style={[
                    styles.segmentText,
                    { color: selected ? colors.primaryText : colors.textMuted },
                  ]}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ThemedText style={[styles.helper, { color: colors.textMuted }]}> 
          {t('activeThemeLabel')}: {resolvedTheme === 'dark' ? t('activeThemeDark') : t('activeThemeLight')}
        </ThemedText>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <ThemedText type="defaultSemiBold">{t('languageSectionTitle')}</ThemedText>
        <View style={styles.dropdownContainer}>
          <Pressable
            style={[styles.dropdownTrigger, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}
            onPress={() => setIsLanguageMenuOpen((current) => !current)}
            disabled={!hasLanguageOptions}
          >
            <ThemedText style={[styles.dropdownTriggerText, { color: colors.text }]}> 
              {selectedLanguageLabel}
            </ThemedText>
            <ThemedText style={[styles.dropdownChevron, { color: colors.textMuted }]}> 
              {isLanguageMenuOpen ? '^' : 'v'}
            </ThemedText>
          </Pressable>

          {isLanguageMenuOpen && hasLanguageOptions ? (
            <View style={[styles.dropdownMenu, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}> 
              {availableLanguages.map((option) => {
                const selected = language === option.value;

                return (
                  <Pressable
                    key={option.value}
                    style={[
                      styles.dropdownOption,
                      selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                    ]}
                    onPress={() => handleLanguageSelect(option.value)}
                  >
                    <ThemedText
                      style={[
                        styles.dropdownOptionText,
                        { color: selected ? colors.primaryText : colors.text },
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </View>

        <ThemedText style={[styles.helper, { color: colors.textMuted }]}> 
          {t('currentLanguageLabel')}: {selectedLanguageLabel}
        </ThemedText>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <ThemedText type="defaultSemiBold">{t('machineSettingsTitle')}</ThemedText>
        <ThemedText style={[styles.helper, { color: colors.textMuted }]}> 
          {t('machineModeLabel')}
        </ThemedText>
        <View style={[styles.segmentedControl, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}> 
          {machineModeOptions.map((option) => {
            const selected = machinePreferenceMode === option.value;

            return (
              <Pressable
                key={option.value}
                style={[
                  styles.segmentButton,
                  selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setMachinePreferenceMode(option.value)}
              >
                <ThemedText
                  style={[
                    styles.segmentText,
                    { color: selected ? colors.primaryText : colors.textMuted },
                  ]}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <ThemedText style={[styles.helper, { color: colors.textMuted }]}> 
          {t('machineModeHelper')}
        </ThemedText>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <ThemedText type="defaultSemiBold">{t('donationSectionTitle')}</ThemedText>
        <ThemedText style={[styles.helper, { color: colors.textMuted }]}> 
          {t('donationDescription')}
        </ThemedText>
        <Pressable
          style={[styles.donateButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
          onPress={handleDonatePress}
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
    paddingBottom: 20,
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
    margin: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
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
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingVertical: 10,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
  },
  helper: {
    fontSize: 13,
  },
  dropdownContainer: {
    gap: 6,
  },
  dropdownTrigger: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownTriggerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dropdownChevron: {
    fontSize: 13,
    fontWeight: '700',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  dropdownOption: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  dropdownOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  donateButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  donateButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
