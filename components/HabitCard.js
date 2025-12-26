import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useState } from 'react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function formatDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isToday(year, month, day) {
  const today = new Date();
  return (
    today.getFullYear() === year &&
    today.getMonth() === month &&
    today.getDate() === day
  );
}

function isPastDate(year, month, day) {
  const date = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
}

export default function HabitCard({ habit, onToggleDate }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const completions = habit.completions || {};

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const handleDatePress = (day) => {
    const dateKey = formatDateKey(currentYear, currentMonth, day);
    if (onToggleDate) {
      onToggleDate(habit.id, dateKey);
    }
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FontAwesome6 
            name={habit.icon} 
            size={24} 
            color={habit.color} 
            style={styles.icon}
          />
          <View>
            <Text style={styles.habitName}>{habit.name}</Text>
            {habit.description ? (
              <Text style={styles.habitDescription} numberOfLines={1}>
                {habit.description}
              </Text>
            ) : null}
          </View>
        </View>
      </View>

      {/* Calendar Navigation */}
      <View style={styles.calendarHeader}>
        <Pressable onPress={() => navigateMonth('prev')} style={styles.navButton}>
          <FontAwesome6 name="chevron-left" size={20} color="#ffffff" />
        </Pressable>
        <Text style={styles.monthYear}>
          {MONTHS[currentMonth]} {currentYear}
        </Text>
        <Pressable onPress={() => navigateMonth('next')} style={styles.navButton}>
          <FontAwesome6 name="chevron-right" size={20} color="#ffffff" />
        </Pressable>
      </View>

      {/* Day labels */}
      <View style={styles.daysRow}>
        {DAYS.map((day) => (
          <View key={day} style={styles.dayLabel}>
            <Text style={styles.dayLabelText}>{day}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {days.map((day, index) => {
          if (day === null) {
            return <View key={`empty-${index}`} style={styles.dateCell} />;
          }

          const dateKey = formatDateKey(currentYear, currentMonth, day);
          const isCompleted = completions[dateKey] === true;
          const isTodayDate = isToday(currentYear, currentMonth, day);
          const isPast = isPastDate(currentYear, currentMonth, day);

          return (
            <Pressable
              key={day}
              style={[
                styles.dateCell,
                isTodayDate && { borderWidth: 2, borderColor: habit.color },
                isCompleted && { backgroundColor: habit.color },
              ]}
              onPress={() => handleDatePress(day)}
            >
              <Text
                style={[
                  styles.dateText,
                  isCompleted && styles.completedDateText,
                  isTodayDate && !isCompleted && [styles.todayText, { color: habit.color }],
                ]}
              >
                {day}
              </Text>
              {isCompleted && (
                <FontAwesome6 name="check" size={12} color="#ffffff" style={styles.checkIcon} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  habitName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  habitDescription: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  navButton: {
    padding: 8,
  },
  monthYear: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  daysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayLabel: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayLabelText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dateCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  dateText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  completedDateText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  todayText: {
    fontWeight: '600',
  },
  checkIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
});

