import "./global.css"
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Pressable, Modal } from 'react-native';
import { SafeAreaView, SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from 'react';

function ModalContent({ visible, onClose }) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.modalOverlay}
        onPress={onClose}
      >
        <View style={[styles.modalContent, { paddingTop: insets.top }]}>
          <Pressable 
            onPress={(e) => e.stopPropagation()}
            style={styles.modalInner}
          >
            <View style={styles.modalHeader}>
              <Text className="text-xl font-bold text-white">Add New Habit</Text>
              <Pressable onPress={onClose}>
                <AntDesign name="close" size={24} color="#ffffff" />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              <Text className="text-white">Modal content goes here</Text>
              <Text className="text-white">Modal content goes here</Text>
              <Text className="text-white">Modal content goes here</Text>
            </View>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

function AppContent() {
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

      <ModalContent 
        visible={modalVisible}
        onClose={handleCloseModal}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#2c2c2c',
    flex: 1,
  },
  modalInner: {
    flex: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalBody: {
    flex: 1,
  },
});
