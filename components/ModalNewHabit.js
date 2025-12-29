import { StyleSheet, Text, View, Pressable, Modal, TextInput, ScrollView, Dimensions, Animated, Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useState, useRef, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');
const MODAL_PADDING = 40; // 20px on each side
const COLOR_GAP = 12;
const COLORS_PER_ROW = 7; // 7 colors per row for 3 rows (21 colors total)
const COLOR_BUTTON_SIZE = (width - MODAL_PADDING - (COLOR_GAP * (COLORS_PER_ROW - 1))) / COLORS_PER_ROW;
const ICONS_PER_ROW = 5; // 5 icons per row
const ICON_BUTTON_SIZE = (width - MODAL_PADDING - (COLOR_GAP * (ICONS_PER_ROW - 1))) / ICONS_PER_ROW;

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#10b981', // emerald
  '#14b8a6', // teal
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#a855f7', // purple
  '#d946ef', // fuchsia
  '#ec4899', // pink
  '#f43f5e', // rose
  '#64748b', // slate
  '#84cc16', // lime
  '#f59e0b', // amber
  '#0ea5e9', // sky blue
  '#be185d', // deep pink
  '#fb7185', // coral
  '#92400e', // brown
];

export const ICONS = [
    // Core / Progress
    'circle-check',
    'calendar',
    'clock',
    'fire',
    'trophy',
    'bullseye',
    'chart-line',
  
    // Health & Fitness
    'heart',
    'shield-heart',
    'droplet',
    'utensils',
    'bed',
    'moon',
    'sun',
    'dumbbell',
    'person-running',
    'leaf',
  
    // Mind, Learning & Self-Care
    'brain',
    'book-open',
    'graduation-cap',
    'pen',
    'face-smile',
    'tree',
    'seedling',
  
    // Lifestyle
    'mug-saucer',
    'house',
    'music',
    'paw',
  
    // Productivity & Work
    'list-check',
    'stopwatch',
    'briefcase',
    'laptop',
    'envelope',
    'bell',
  
    // Personal Care & Finance
    'tooth',
    'shower',
    'wallet',
  
    // Environment & Values
    'recycle',
  
    // Social
    'users',

    // Travel & Leisure
    'plane',
    'suitcase',
    'map-location',
    'camera',
    'car',
    'bicycle',

    // Entertainment
    'tv',
    'gamepad',
    'masks-theater',
    'clapperboard',
    'palette',
];

// Reminder Card Component with animation
function ReminderCard({ reminder, selectedColor, isNewReminder, onToggleDay, onEditReminder, onDeleteReminder }) {
  const fadeAnim = useRef(new Animated.Value(isNewReminder ? 0 : 1)).current;
  const scaleAnim = useRef(new Animated.Value(isNewReminder ? 0.8 : 1)).current;

  useEffect(() => {
    if (isNewReminder) {
      // Reset animations first
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
      
      // Smooth fade in and scale up animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Ensure non-new reminders are fully visible
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
    }
  }, [isNewReminder]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Animated.View
      style={[
        styles.reminderCard,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <View style={styles.reminderHeader}>
        <Text style={styles.reminderTitle}>Reminder</Text>
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
            onDeleteReminder(reminder.id);
          }}
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
            <View key={day} style={{ marginHorizontal: 4, marginVertical: 4 }}>
              <Pressable
                onPress={() => onToggleDay(reminder.id, day)}
                style={[
                  styles.dayButton,
                  { backgroundColor: isSelected ? selectedColor : '#1c1c1c' },
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
            </View>
          );
        })}
      </View>

      {/* Time Selection */}
      <Pressable
        onPress={() => {
          Keyboard.dismiss();
          onEditReminder(reminder);
        }}
        style={styles.timeContainer}
      >
        <FontAwesome6 name="clock" size={20} color="#ffffff" style={styles.clockIcon} />
        <Text style={styles.timeText}>{reminder.time}</Text>
      </Pressable>
    </Animated.View>
  );
}

// Helper function to round time up to nearest 30 minutes
function roundTimeToNext30Minutes() {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.ceil(minutes / 30) * 30;
  
  let hours = now.getHours();
  let finalMinutes = roundedMinutes;
  
  if (roundedMinutes >= 60) {
    hours = (hours + 1) % 24;
    finalMinutes = 0;
  }
  
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${String(finalMinutes).padStart(2, '0')} ${period}`;
}

export default function ModalNewHabit({ visible, onClose, onSave, editingHabit }) {
  const insets = useSafeAreaInsets();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[3]); // default to green
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]); // default to circle-check
  const [completionsPerDay, setCompletionsPerDay] = useState('1');
  const [reminders, setReminders] = useState([]);
  const [remindersExpanded, setRemindersExpanded] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [newReminderAnimation, setNewReminderAnimation] = useState(null);
  
  const animatedHeight = useRef(new Animated.Value(0)).current;

  // Populate form when modal opens (either with editingHabit or reset for new habit)
  useEffect(() => {
    if (visible) {
      if (editingHabit) {
        // Populate form with existing habit data
        setName(editingHabit.name || '');
        setDescription(editingHabit.description || '');
        setSelectedColor(editingHabit.color || COLORS[3]);
        setSelectedIcon(editingHabit.icon || ICONS[0]);
        setCompletionsPerDay(String(editingHabit.completionsPerDay || 1));
        setReminders(editingHabit.reminders || []);
      } else {
        // Reset form for new habit
        setName('');
        setDescription('');
        setSelectedColor(COLORS[3]);
        setSelectedIcon(ICONS[0]);
        setCompletionsPerDay('1');
        setReminders([]);
      }
      // Always reset these states when modal opens
      setRemindersExpanded(false);
      setEditingReminderId(null);
      setShowTimePicker(false);
      animatedHeight.setValue(0);
    }
  }, [visible, editingHabit, animatedHeight]);

  const toggleRemindersSection = () => {
    Keyboard.dismiss();
    const toValue = remindersExpanded ? 0 : 1;
    setRemindersExpanded(!remindersExpanded);
    
    Animated.timing(animatedHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleAddReminder = () => {
    Keyboard.dismiss();
    // Get current day
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1; // Sunday (0) becomes 6, Monday (1) becomes 0, etc.
    const currentDay = DAYS[dayIndex];
    
    // Get rounded time
    const defaultTime = roundTimeToNext30Minutes();
    
    const newReminderId = Date.now().toString();
    const newReminder = {
      id: newReminderId,
      time: defaultTime,
      days: [currentDay],
    };
    
    // Add to the top of the list
    setReminders([newReminder, ...reminders]);
    
    // Animate the new reminder
    setNewReminderAnimation(newReminderId);
    setTimeout(() => {
      setNewReminderAnimation(null);
    }, 600);
  };

  const handleDeleteReminder = (reminderId) => {
    setReminders(reminders.filter(r => r.id !== reminderId));
  };

  const handleToggleDay = (reminderId, day) => {
    Keyboard.dismiss();
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
    // Dismiss keyboard before opening time picker
    Keyboard.dismiss();
    
    // Parse time string to Date object for picker
    const [timePart, period] = reminder.time.split(' ');
    const [hours, minutes] = timePart.split(':').map(Number);
    let hours24 = hours;
    if (period === 'PM' && hours !== 12) hours24 += 12;
    if (period === 'AM' && hours === 12) hours24 = 0;
    
    const date = new Date();
    date.setHours(hours24, minutes, 0, 0);
    setSelectedTime(date);
    setEditingReminderId(reminder.id);
    setShowTimePicker(true);
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
          r.id === editingReminderId
            ? { ...r, time: timeString }
            : r
        ));
        setEditingReminderId(null);
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
          r.id === editingReminderId
            ? { ...r, time: timeString }
            : r
        ));
      }
    }
  };

  const handleDonePress = () => {
    setShowTimePicker(false);
    setEditingReminderId(null);
  };

  const handleCompletionsPerDayChange = (text) => {
    // Only allow numeric input
    const numericValue = text.replace(/[^0-9]/g, '');
    if (numericValue === '' || (parseInt(numericValue) > 0)) {
      setCompletionsPerDay(numericValue);
    }
  };

  const handleSave = () => {
    Keyboard.dismiss();
    if (!name.trim()) {
      // Optional: You could add validation/error handling here
      return;
    }

    const completionsPerDayValue = parseInt(completionsPerDay) || 1;
    if (completionsPerDayValue <= 0) {
      // Invalid value, default to 1
      setCompletionsPerDay('1');
      return;
    }

    const habit = {
      id: editingHabit ? editingHabit.id : Date.now().toString(), // Keep existing ID when editing
      name: name.trim(),
      description: description.trim(),
      color: selectedColor,
      icon: selectedIcon,
      completionsPerDay: completionsPerDayValue,
      reminders: reminders,
      createdAt: editingHabit ? editingHabit.createdAt : new Date().toISOString(), // Keep original createdAt when editing
      completions: editingHabit ? editingHabit.completions : {}, // Keep existing completions when editing
    };

    if (onSave) {
      onSave(habit);
    }

    // Reset form
    setName('');
    setDescription('');
    setSelectedColor(COLORS[3]);
    setSelectedIcon(ICONS[0]);
    setCompletionsPerDay('1');
    setReminders([]);
    setRemindersExpanded(false);
    animatedHeight.setValue(0);
    
    onClose();
  };

  // Max height for reminders section (enough to accommodate multiple reminders)
  // Increased to prevent cutoff when there are many reminders
  const maxRemindersHeight = 1000;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Tap outside to close */}
        <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }} 
          pointerEvents="box-none" 
        />

        {/* Content: swallow touches so they don't reach overlay */}
        <View style={[styles.modalContent, { paddingTop: insets.top }]}>
          <View style={styles.modalInner}>
            <View style={styles.modalHeader}>
              <Text className="text-2xl font-bold text-white text-center">
                {editingHabit ? 'Edit Habit' : 'New Habit'}
              </Text>
              <Pressable 
                onPress={() => {
                  Keyboard.dismiss();
                  onClose();
                }} 
                style={styles.closeButton}
              >
                <FontAwesome6 name="xmark" size={32} color="#ffffff" />
              </Pressable>
            </View>
            <ScrollView 
              style={styles.modalBody} 
              contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 }]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.formSection}>
                <Text className="text-white text-base font-semibold mb-2">Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter habit name"
                  placeholderTextColor="#9ca3af"
                  value={name}
                  onChangeText={setName}
                  className="text-white"
                />
              </View>

              <View style={styles.formSection}>
                <Text className="text-white text-base font-semibold mb-2">Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter habit description"
                  placeholderTextColor="#9ca3af"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  className="text-white"
                />
              </View>

              <View style={styles.formSection}>
                <Text className="text-white text-base font-semibold mb-2">Completions per day</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1"
                  placeholderTextColor="#9ca3af"
                  value={completionsPerDay}
                  onChangeText={handleCompletionsPerDayChange}
                  keyboardType="numeric"
                  className="text-white"
                />
              </View>

              <View style={styles.formSection}>
                <Text className="text-white text-base font-semibold mb-2">Reminders</Text>
                <Pressable
                  onPress={toggleRemindersSection}
                  style={styles.remindersButton}
                >
                  <Text className="text-white text-base font-semibold">
                    {reminders.length === 0 
                      ? '0 Active reminders' 
                      : `${reminders.length} Active reminder${reminders.length > 1 ? 's' : ''}`}
                  </Text>
                  <FontAwesome6 
                    name={remindersExpanded ? "chevron-down" : "chevron-right"} 
                    size={16} 
                    color="#9ca3af" 
                  />
                </Pressable>
                
                {/* Expandable Reminders Section */}
                <Animated.View
                  style={{
                    maxHeight: animatedHeight.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, maxRemindersHeight],
                    }),
                    overflow: 'hidden',
                  }}
                >
                  <View style={styles.remindersExpandedContent}>
                    {/* Add Reminder Button - At the top */}
                    <Pressable
                      onPress={handleAddReminder}
                      style={[styles.addButton, { backgroundColor: selectedColor }]}
                    >
                      <FontAwesome6 name="plus" size={20} color="#ffffff" style={styles.addIcon} />
                      <Text style={[styles.addButtonText, { color: '#ffffff' }]}>Add Reminder</Text>
                    </Pressable>

                    {/* Reminders List */}
                    {reminders.map((reminder) => (
                      <ReminderCard
                        key={reminder.id}
                        reminder={reminder}
                        selectedColor={selectedColor}
                        isNewReminder={newReminderAnimation === reminder.id}
                        onToggleDay={handleToggleDay}
                        onEditReminder={handleEditReminder}
                        onDeleteReminder={handleDeleteReminder}
                      />
                    ))}
                  </View>
                </Animated.View>
              </View>

              <View style={styles.formSection}>
                <Text className="text-white text-base font-semibold mb-3">Color</Text>
                <View style={styles.colorGrid}>
                  {COLORS.map((color, index) => (
                    <Pressable
                      key={index}
                      onPress={() => {
                        Keyboard.dismiss();
                        setSelectedColor(color);
                      }}
                      style={[
                        styles.colorButton,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorButtonSelected,
                        (index % COLORS_PER_ROW === COLORS_PER_ROW - 1) && styles.colorButtonLastInRow
                      ]}
                    >
                      {selectedColor === color && (
                        <FontAwesome6 name="check" size={16} color="#ffffff" />
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.formSection}>
                <Text className="text-white text-base font-semibold mb-3">Icon</Text>
                <View style={styles.iconGrid}>
                  {ICONS.map((icon, index) => (
                    <Pressable
                      key={index}
                      onPress={() => {
                        Keyboard.dismiss();
                        setSelectedIcon(icon);
                      }}
                      style={[
                        styles.iconButton,
                        selectedIcon === icon && styles.iconButtonSelected,
                        (index % ICONS_PER_ROW === ICONS_PER_ROW - 1) && styles.iconButtonLastInRow
                      ]}
                    >
                      <FontAwesome6 
                        name={icon} 
                        size={24} 
                        color={selectedIcon === icon ? selectedColor : '#9ca3af'} 
                      />
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>
            <View style={[styles.saveButtonContainer, { paddingBottom: insets.bottom }]}>
              <Pressable 
                onPress={() => {
                  Keyboard.dismiss();
                  handleSave();
                }}
                style={[styles.saveButton, { backgroundColor: selectedColor }]}
              >
                <Text className="text-white font-semibold text-base">Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

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
                <Text style={[styles.pickerDoneText, { color: selectedColor }]}>Done</Text>
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
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    right: 0,
  },
  modalBody: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  saveButtonContainer: {
    paddingTop: 16,
    paddingHorizontal: 20,
    backgroundColor: '#2c2c2c',
    borderTopWidth: 1,
    borderTopColor: '#404040',
  },
  saveButton: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formSection: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#1c1c1c',
    borderWidth: 1,
    borderColor: '#404040',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorButton: {
    width: COLOR_BUTTON_SIZE,
    height: COLOR_BUTTON_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: COLOR_GAP,
    marginBottom: COLOR_GAP,
  },
  colorButtonLastInRow: {
    marginRight: 0,
  },
  colorButtonSelected: {
    borderColor: '#ffffff',
    borderWidth: 3,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  iconButton: {
    width: ICON_BUTTON_SIZE,
    height: ICON_BUTTON_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#404040',
    backgroundColor: '#1c1c1c',
    marginRight: COLOR_GAP,
    marginBottom: COLOR_GAP,
  },
  iconButtonLastInRow: {
    marginRight: 0,
  },
  iconButtonSelected: {
    borderColor: '#ffffff',
    borderWidth: 3,
    backgroundColor: '#2c2c2c',
  },
  remindersButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
    borderWidth: 1,
    borderColor: '#404040',
    borderRadius: 8,
    padding: 12,
  },
  remindersExpandedContent: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  reminderCard: {
    backgroundColor: '#2c2c2c',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
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
    marginHorizontal: -4,
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
    borderRadius: 8,
    padding: 16,
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
