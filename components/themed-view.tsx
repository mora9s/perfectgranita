import { View, type ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/app/theme/theme-context';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ style, ...otherProps }: ThemedViewProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }, style]}
      {...otherProps}
    />
  );
}

const styles = StyleSheet.create({
  container: {},
});
