import { Alert, Linking, Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLanguage, type AppLanguage } from '@/app/language/language-context';
import { useTheme, type ThemePreference } from '@/app/theme/theme-context';

const DONATION_URL = 'https://www.paypal.com/donate?hosted_button_id=YOUR_PAYPAL_HOSTED_BUTTON_ID';

export default function SettingsScreen() {
  const { colors, themePreference, setThemePreference, resolvedTheme } = useTheme();
  const { language, setLanguage, t, availableLanguages } = useLanguage();

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
        <View style={[styles.segmentedControl, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}> 
          {availableLanguages.map((option) => {
            const selected = language === option.value;

            return (
              <Pressable
                key={option.value}
                style={[
                  styles.segmentButton,
                  selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setLanguage(option.value as AppLanguage)}
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
          {t('currentLanguageLabel')}: {availableLanguages.find((option) => option.value === language)?.label}
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
