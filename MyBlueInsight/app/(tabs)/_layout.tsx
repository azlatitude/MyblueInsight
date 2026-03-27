import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const tint = colorScheme === 'dark' ? '#fff' : '#007AFF';
  const inactiveTint = colorScheme === 'dark' ? '#666' : '#8E8E93';
  const bg = colorScheme === 'dark' ? '#000' : '#fff';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarStyle: { backgroundColor: bg },
        headerStyle: { backgroundColor: bg },
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Calendar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="art"
        options={{
          title: 'Art',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="color-palette-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
