import { Stack } from 'expo-router';
import { LanguageProvider } from '@/app/language/language-context';
import { MachineProvider } from '@/app/machine/machine-context';
import { ThemeProvider } from '@/app/theme/theme-context';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <MachineProvider>
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
        </MachineProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
