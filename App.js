import "./global.css"
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect } from 'react';
import HabitsScreen from './screens/HabitsScreen';
import SettinsScreen from './screens/SettinsScreen copy';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import { initializeNotifications } from './utils/notifications';

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Request notification permissions on app startup
    initializeNotifications();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
                <Stack.Navigator
                  screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: '#1c1c1c' },
                  }}
                >
                  <Stack.Screen name="HabitsScreen" component={HabitsScreen} />
                  <Stack.Screen name="SettinsScreen" component={SettinsScreen} />
                  <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} />
                </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
