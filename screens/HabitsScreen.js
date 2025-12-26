import { StyleSheet, Text, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from 'react';
import ModalNewHabit from '../components/ModalNewHabit';

export default function HabitsScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  const handleAddHabit = () => {
    setModalVisible(true);
  }

  const handleCloseModal = () => {
    setModalVisible(false);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

      <ModalNewHabit 
        visible={modalVisible}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
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

