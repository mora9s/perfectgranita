import { Stack } from 'expo-router';
import { MachineProvider } from '@/app/machine/machine-context';

export default function RootLayout() {
  return (
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
  );
}
