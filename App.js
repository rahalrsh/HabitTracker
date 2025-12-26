import "./global.css"
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HabitsScreen from './screens/HabitsScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <HabitsScreen />
    </SafeAreaProvider>
  );
}
