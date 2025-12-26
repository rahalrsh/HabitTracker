import "./global.css"
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

export default function App() {
  const handleAddHabit = () => {
    console.log("Add Habit");
  }

  return (
    <View style={styles.container}>
      <AntDesign name="plus-circle" size={32} color="#22c55e" />
      <Text className="text-xl font-bold text-green-500">No habit found</Text>
      <Text className="text-md text-green-500">Create a new habit to get started</Text>
      <Pressable 
        onPress={handleAddHabit}
        className="bg-green-500 rounded-lg px-6 py-3 mt-4"
      >
        <Text className="text-white font-semibold text-base">Get Started</Text>
      </Pressable>
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
