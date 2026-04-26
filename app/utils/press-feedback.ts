import type { ViewStyle } from 'react-native';
import { Platform, Vibration } from 'react-native';
import * as Haptics from 'expo-haptics';

const MARKED_PRESS_SCALE = 0.96;
const MARKED_PRESS_OPACITY = 0.92;

export function withHaptics<T extends (...args: never[]) => unknown>(
  handler: T,
  impact: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  fallbackMs: number = 10,
) {
  return (...args: Parameters<T>) => {
    void (async () => {
      try {
        if (Platform.OS === 'android') {
          await Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Clock_Tick);
          if (impact !== Haptics.ImpactFeedbackStyle.Light) {
            await Haptics.impactAsync(impact);
          }
        } else if (impact === Haptics.ImpactFeedbackStyle.Light) {
          await Haptics.selectionAsync();
        } else {
          await Haptics.impactAsync(impact);
        }
      } catch {
        // keep behavior resilient if the native module is unavailable
      }

      if (Platform.OS !== 'web') {
        Vibration.vibrate(fallbackMs);
      }

      handler(...args);
    })();
  };
}

export function getMarkedPressStyle(
  pressed: boolean,
  options: { scale?: number; opacity?: number } = {},
): ViewStyle {
  if (!pressed) {
    return {};
  }

  const scale = Math.max(options.scale ?? MARKED_PRESS_SCALE, MARKED_PRESS_SCALE);
  const opacity = Math.max(options.opacity ?? MARKED_PRESS_OPACITY, MARKED_PRESS_OPACITY);

  return {
    transform: [{ scale }],
    opacity,
  };
}
