import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LanguageProvider } from '@/app/language/language-context';
import { MachineProvider } from '@/app/machine/machine-context';
import { ThemeProvider, useTheme } from '@/app/theme/theme-context';

function AppNavigator() {
  const { resolvedTheme } = useTheme();

  return (
    <>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="recipe/[id]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MachineProvider>
          <AppNavigator />
        </MachineProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
