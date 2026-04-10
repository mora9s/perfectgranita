import { Pressable, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme, type ThemePreference } from '@/app/theme/theme-context';

const OPTIONS: Array<{ value: ThemePreference; label: string }> = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'system', label: 'Système' },
];

export default function SettingsScreen() {
  const { colors, themePreference, setThemePreference, resolvedTheme } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
        <ThemedText type="title" style={styles.headerTitle}>
          ⚙️ Paramètres
        </ThemedText>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <ThemedText type="defaultSemiBold">Apparence</ThemedText>
        <View style={[styles.segmentedControl, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
          {OPTIONS.map((option) => {
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
          Thème actif: {resolvedTheme === 'dark' ? 'Sombre' : 'Clair'}
        </ThemedText>
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
});
