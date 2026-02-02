import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    // Stack คือการซ้อนหน้าจอ (headerShown: false คือซ่อนแถบหัวด้านบนทิ้งไป)
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}