import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HabitCard from '../components/HabitCard';
import ModalNewHabit from '../components/ModalNewHabit';
import { scheduleHabitNotifications, cancelAllHabitNotifications } from '../utils/notifications';

const HABITS_STORAGE_KEY = '@habits_storage';

export default function HabitsScreen({ navigation }) {
  const [habits, setHabits] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load habits from AsyncStorage on mount and reschedule notifications
  useEffect(() => {
    loadHabits();
  }, []);

  // Reschedule notifications when habits are loaded (in case app was reinstalled/notifications cleared)
  useEffect(() => {
    if (!isLoading && habits.length > 0) {
      // Reschedule all notifications for all habits
      const rescheduleNotifications = async () => {
        for (const habit of habits) {
          if (habit.reminders && habit.reminders.length > 0) {
            await scheduleHabitNotifications(habit);
          }
        }
      };
      rescheduleNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]); // Only run once when loading completes

  // Save habits to AsyncStorage whenever habits change
  useEffect(() => {
    if (!isLoading) {
      saveHabits(habits);
    }
  }, [habits, isLoading]);

  const loadHabits = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
      if (jsonValue != null) {
        const loadedHabits = JSON.parse(jsonValue);
        setHabits(loadedHabits);
        console.log('Habits loaded from storage:', loadedHabits.length);
      }
    } catch (e) {
      console.error('Error loading habits:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHabits = async (habitsToSave) => {
    try {
      const jsonValue = JSON.stringify(habitsToSave);
      await AsyncStorage.setItem(HABITS_STORAGE_KEY, jsonValue);
      console.log('Habits saved to storage:', habitsToSave.length);
    } catch (e) {
      console.error('Error saving habits:', e);
    }
  };

  const handleAddHabit = () => {
    setEditingHabit(null); // Clear editing habit for new habit
    setModalVisible(true);
  }

  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingHabit(null); // Clear editing habit when modal closes
  }

  const handleSaveHabit = async (habit) => {
    // Schedule notifications for the habit's reminders
    await scheduleHabitNotifications(habit);
    
    setHabits(prevHabits => {
      if (editingHabit) {
        // Update existing habit
        const updatedHabits = prevHabits.map(h => 
          h.id === habit.id ? habit : h
        );
        console.log('Habit updated:', habit);
        return updatedHabits;
      } else {
        // Add new habit
        const updatedHabits = [...prevHabits, habit];
        console.log('Habit saved:', habit);
        return updatedHabits;
      }
    });
    setEditingHabit(null);
  }

  const handleEditHabit = (habit) => {
    setEditingHabit(habit);
    setModalVisible(true);
  }

  const handleDeleteHabit = async (habitId) => {
    // Cancel all notifications for this habit
    await cancelAllHabitNotifications(habitId);
    
    setHabits(prevHabits => {
      const updatedHabits = prevHabits.filter(h => h.id !== habitId);
      console.log('Habit deleted:', habitId);
      return updatedHabits;
    });
  }

  const handleToggleDate = (habitId, dateKey) => {
    setHabits(prevHabits =>
      prevHabits.map(habit => {
        if (habit.id === habitId) {
          const newCompletions = { ...habit.completions };
          const completionsPerDay = habit.completionsPerDay || 1;
          
          // Handle both old format (boolean) and new format (number)
          const currentValue = newCompletions[dateKey];
          const currentCount = currentValue === true ? 1 : (typeof currentValue === 'number' ? currentValue : 0);
          
          // Increment count, reset to 0 if it reaches completionsPerDay
          const newCount = (currentCount + 1) % (completionsPerDay + 1);
          
          if (newCount === 0) {
            delete newCompletions[dateKey];
          } else {
            newCompletions[dateKey] = newCount;
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
      
      <ModalNewHabit
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveHabit}
        editingHabit={editingHabit}
      />
      
      {isLoading ? (
        <View style={styles.emptyState}>
          <Text className="text-xl font-bold text-green-500">Loading...</Text>
        </View>
      ) : habits.length === 0 ? (
        <View style={styles.emptyState}>
          <AntDesign name="plus-circle" size={32} color="#22c55e" />
          <Text className="text-xl font-bold text-green-500 mt-4">No habit found</Text>
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
                onEdit={handleEditHabit}
                onDelete={handleDeleteHabit}
              />
            ))}
          </ScrollView>
        </View>
      )}
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

