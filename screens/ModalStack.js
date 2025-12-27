import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ModalNewHabit from '../components/ModalNewHabit';
import ReminderScreen from './ReminderScreen';

const Stack = createNativeStackNavigator();

export default function ModalStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: 'transparent' },
      }}
    >
      <Stack.Screen 
        name="ModalNewHabit" 
        component={ModalNewHabit}
        options={{
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <Stack.Screen 
        name="ReminderScreen" 
        component={ReminderScreen}
        options={{
          contentStyle: { backgroundColor: '#1c1c1c' },
        }}
      />
    </Stack.Navigator>
  );
}

