import "./global.css"
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HabitsScreen from './screens/HabitsScreen';
import ModalStack from './screens/ModalStack';

const Stack = createNativeStackNavigator();

export default function App() {
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
          <Stack.Screen 
            name="ModalStack" 
            component={ModalStack}
            options={{
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
