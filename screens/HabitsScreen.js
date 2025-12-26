import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState } from 'react';
import ModalNewHabit from '../components/ModalNewHabit';
import HabitCard from '../components/HabitCard';

export default function HabitsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [habits, setHabits] = useState([]);

  const handleAddHabit = () => {
    setModalVisible(true);
  }

  const handleCloseModal = () => {
    setModalVisible(false);
  }

  const handleSaveHabit = (habit) => {
    setHabits(prevHabits => {
      const updatedHabits = [...prevHabits, habit];
      console.log('Habit saved:', habit);
    //   console.log('All habits:', updatedHabits);
      return updatedHabits;
    });
  }

  const handleToggleDate = (habitId, dateKey) => {
    setHabits(prevHabits =>
      prevHabits.map(habit => {
        if (habit.id === habitId) {
          const newCompletions = { ...habit.completions };
          // Toggle completion for the date
          if (newCompletions[dateKey]) {
            delete newCompletions[dateKey];
          } else {
            newCompletions[dateKey] = true;
          }
          return { ...habit, completions: newCompletions };
        }
        return habit;
      })
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      
      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <AntDesign name="plus-circle" size={32} color="#22c55e" />
          <Text className="text-xl font-bold text-green-500">No habit found</Text>
          <Text className="text-md text-green-500">Create a new habit to get started</Text>
          <Pressable 
            onPress={handleAddHabit}
            className="bg-green-500 rounded-lg px-6 py-3 mt-4"
          >
            <Text className="text-white font-semibold text-base">Get Started</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.habitsContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>My Habits</Text>
            <Pressable 
              onPress={handleAddHabit}
              style={styles.addButton}
            >
              <AntDesign name="plus" size={24} color="#22c55e" />
            </Pressable>
          </View>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onToggleDate={handleToggleDate}
              />
            ))}
          </ScrollView>
        </View>
      )}

      <ModalNewHabit 
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveHabit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitsContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2c2c2c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});

