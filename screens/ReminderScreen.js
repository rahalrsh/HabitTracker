import { StyleSheet, Text, View, Pressable, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ReminderScreen({ route, navigation }) {
  const { habit, onUpdateReminders, habitColor } = route.params;
  const [reminders, setReminders] = useState(habit.reminders || []);
  const [editingReminder, setEditingReminder] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());

  useEffect(() => {
    // Update parent when reminders change
    if (onUpdateReminders) {
      onUpdateReminders(reminders);
    }
  }, [reminders]);

  const handleAddReminder = () => {
    const newReminder = {
      id: Date.now().toString(),
      time: '10:00 AM',
      days: [],
    };
    setReminders([...reminders, newReminder]);
    setEditingReminder(newReminder.id);
    setSelectedTime(new Date());
    setShowTimePicker(true);
  };

  const handleDeleteReminder = (reminderId) => {
    setReminders(reminders.filter(r => r.id !== reminderId));
  };

  const handleTimeChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
      if (event.type === 'set' && date) {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const timeString = `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
        
        setReminders(reminders.map(r =>
          r.id === editingReminder
            ? { ...r, time: timeString }
            : r
        ));
        setEditingReminder(null);
      }
    } else {
      // iOS
      if (date) {
        setSelectedTime(date);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const timeString = `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
        
        setReminders(reminders.map(r =>
          r.id === editingReminder
            ? { ...r, time: timeString }
            : r
        ));
      }
    }
  };

  const handleDonePress = () => {
    setShowTimePicker(false);
    setEditingReminder(null);
  };

  const handleToggleDay = (reminderId, day) => {
    setReminders(reminders.map(reminder => {
      if (reminder.id === reminderId) {
        const days = reminder.days || [];
        const newDays = days.includes(day)
          ? days.filter(d => d !== day)
          : [...days, day];
        return { ...reminder, days: newDays };
      }
      return reminder;
    }));
  };

  const handleEditReminder = (reminder) => {
    // Parse time string to Date object for picker
    const [timePart, period] = reminder.time.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);
    let hours24 = hours;
    if (period === 'PM' && hours !== 12) hours24 += 12;
    if (period === 'AM' && hours === 12) hours24 = 0;
    
    const date = new Date();
    date.setHours(hours24, minutes, 0, 0);
    setSelectedTime(date);
    setEditingReminder(reminder.id);
    setShowTimePicker(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <FontAwesome6 name="chevron-left" size={24} color="#ffffff" />
        </Pressable>
        <Text style={styles.headerTitle}>{habit.name}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {reminders.map((reminder, index) => (
          <View key={reminder.id} style={styles.reminderCard}>
            <View style={styles.reminderHeader}>
              <Text style={styles.reminderTitle}>Reminder #{index + 1}</Text>
              <Pressable
                onPress={() => handleDeleteReminder(reminder.id)}
                style={styles.deleteButton}
              >
                <FontAwesome6 name="trash" size={20} color="#ffffff" />
              </Pressable>
            </View>

            {/* Day Selection */}
            <View style={styles.daysContainer}>
              {DAYS.map((day) => {
                const isSelected = (reminder.days || []).includes(day);
                return (
                  <Pressable
                    key={day}
                    onPress={() => handleToggleDay(reminder.id, day)}
                    style={[
                      styles.dayButton,
                      { backgroundColor: isSelected ? habitColor : '#1c1c1c' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayButtonText,
                        { color: isSelected ? '#ffffff' : '#9ca3af' },
                      ]}
                    >
                      {day}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Time Selection */}
            <Pressable
              onPress={() => handleEditReminder(reminder)}
              style={styles.timeContainer}
            >
              <FontAwesome6 name="clock" size={20} color="#ffffff" style={styles.clockIcon} />
              <Text style={styles.timeText}>{reminder.time}</Text>
            </Pressable>
          </View>
        ))}

        {/* Add Reminder Button */}
        <Pressable
          onPress={handleAddReminder}
          style={[styles.addButton, { borderColor: habitColor }]}
        >
          <FontAwesome6 name="plus" size={20} color={habitColor} style={styles.addIcon} />
          <Text style={[styles.addButtonText, { color: habitColor }]}>Add Reminder</Text>
        </Pressable>
      </ScrollView>

      {/* Time Picker Modal for iOS */}
      {showTimePicker && Platform.OS === 'ios' && (
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Pressable
                onPress={handleDonePress}
                style={styles.pickerCancelButton}
              >
                <Text style={styles.pickerCancelText}>Cancel</Text>
              </Pressable>
              <Text style={styles.pickerTitle}>Select Time</Text>
              <Pressable
                onPress={handleDonePress}
                style={styles.pickerDoneButton}
              >
                <Text style={[styles.pickerDoneText, { color: habitColor }]}>Done</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={selectedTime}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={handleTimeChange}
              style={styles.picker}
            />
          </View>
        </View>
      )}

      {/* Android Time Picker */}
      {showTimePicker && Platform.OS === 'android' && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2c',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  reminderCard: {
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  reminderTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  dayButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#404040',
  },
  dayButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#404040',
  },
  clockIcon: {
    marginRight: 12,
  },
  timeText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1c1c1c',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    marginTop: 8,
  },
  addIcon: {
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#2c2c2c',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#404040',
  },
  pickerCancelButton: {
    padding: 8,
  },
  pickerCancelText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  pickerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  pickerDoneButton: {
    padding: 8,
  },
  pickerDoneText: {
    fontSize: 16,
    fontWeight: '600',
  },
  picker: {
    height: 200,
  },
});

