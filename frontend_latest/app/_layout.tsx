import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { CartProvider } from '../context/CartContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <CartProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="cart" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="bundle-tracker" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="profile" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="checkout" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="product/[slug]" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="category/[slug]" options={{ headerShown: false, animation: 'slide_from_right' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </CartProvider>
  );
}
