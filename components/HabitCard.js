import { StyleSheet, Text, View, Pressable, ScrollView, Animated } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useState, useRef, useEffect } from 'react';

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

// Helper function to interpolate color between grey and habit color based on completion percentage
function getCompletionColor(completionCount, completionsPerDay, habitColor) {
  if (completionCount === 0) {
    return '#404040'; // Grey for no completion
  }
  
  const percentage = completionCount / completionsPerDay;
  
  // Parse habit color (hex)
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  
  const startColor = hexToRgb('#404040');
  const endColor = hexToRgb(habitColor);
  
  if (!startColor || !endColor) return habitColor;
  
  const r = Math.round(startColor.r + (endColor.r - startColor.r) * percentage);
  const g = Math.round(startColor.g + (endColor.g - startColor.g) * percentage);
  const b = Math.round(startColor.b + (endColor.b - startColor.b) * percentage);
  
  return rgbToHex(r, g, b);
}

function getLast52Weeks() {
  const weeks = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Start from 52 weeks ago (364 days ago)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 363); // 364 days = 52 weeks, but we include today, so 363 days back
  
  // Organize days into weeks (7 days per week, 52 weeks)
  for (let week = 0; week < 52; week++) {
    const weekDays = [];
    for (let day = 0; day < 7; day++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + (week * 7) + day);
      weekDays.push(date);
    }
    weeks.push(weekDays);
  }
  
  return weeks;
}

export default function HabitCard({ habit, onToggleDate, onEdit, onDelete }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const scrollViewRef = useRef(null);
  const calendarHeight = useRef(new Animated.Value(0)).current;
  const touchRef = useRef({ startX: 0, startY: 0, startTime: 0, isScrolling: false });

  const completions = habit.completions || {};
  const completionsPerDay = habit.completionsPerDay || 1;
  
  // Helper to get completion count, handling both old boolean and new number format
  const getCompletionCount = (dateKey) => {
    const value = completions[dateKey];
    if (value === true) return 1; // Old format
    if (typeof value === 'number') return value; // New format
    return 0;
  };

  useEffect(() => {
    Animated.timing(calendarHeight, {
      toValue: isCalendarExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isCalendarExpanded]);

  useEffect(() => {
    // Scroll to the end (right) to show the most recent week
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: false });
      }
    }, 100);
  }, []);

  const handleMarkToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const dateKey = formatDateKey(year, month, day);
    
    if (onToggleDate) {
      onToggleDate(habit.id, dateKey);
    }
  };

  const getTodayCompletion = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const dateKey = formatDateKey(year, month, day);
    return getCompletionCount(dateKey);
  };

  const isTodayCompleted = () => {
    const todayCompletion = getTodayCompletion();
    return todayCompletion >= completionsPerDay;
  };

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

  const toggleCalendar = () => {
    setIsCalendarExpanded(!isCalendarExpanded);
  };

  // Estimate calendar height (approximate)
  const estimatedCalendarHeight = 350;

  const calendarHeightInterpolation = calendarHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, estimatedCalendarHeight],
  });

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable 
          style={styles.headerLeft}
          onPress={toggleCalendar}
        >
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
        </Pressable>
        <Pressable 
          onPress={(e) => {
            e.stopPropagation();
            handleMarkToday();
          }}
          style={[
            styles.checkButton,
            { 
              borderColor: habit.color,
              backgroundColor: completionsPerDay === 1 
                ? (isTodayCompleted() ? habit.color : 'transparent')
                : getCompletionColor(getTodayCompletion(), completionsPerDay, habit.color)
            }
          ]}
        >
          {completionsPerDay > 1 ? (
            isTodayCompleted() ? (
              <FontAwesome6 
                name="check" 
                size={20} 
                color="#ffffff" 
              />
            ) : getTodayCompletion() > 0 ? (
              <Text style={styles.checkButtonText}>
                {getTodayCompletion()}/{completionsPerDay}
              </Text>
            ) : (
              <FontAwesome6 
                name="check" 
                size={20} 
                color={habit.color} 
              />
            )
          ) : (
            <FontAwesome6 
              name="check" 
              size={20} 
              color={isTodayCompleted() ? "#ffffff" : habit.color} 
            />
          )}
        </Pressable>
      </View>

      {/* 52 Week Contribution Graph */}
      <View style={styles.contributionContainer}>
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.contributionScrollContent}
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
          onScrollBeginDrag={() => {
            touchRef.current.isScrolling = true;
          }}
          onMomentumScrollBegin={() => {
            touchRef.current.isScrolling = true;
          }}
          onScrollEndDrag={() => {
            // Reset after a delay to allow tap detection
            setTimeout(() => {
              touchRef.current.isScrolling = false;
            }, 100);
          }}
        >
          <Pressable
            onPress={() => {
              // Only toggle if not scrolling
              setTimeout(() => {
                if (!touchRef.current.isScrolling) {
                  toggleCalendar();
                }
              }, 50);
            }}
            delayPressIn={100}
            style={styles.contributionGridWrapper}
          >
            <View style={styles.contributionGrid}>
              {getLast52Weeks().map((week, weekIndex) => (
              <View 
                key={weekIndex} 
                style={[
                  styles.contributionWeek,
                  weekIndex === 51 && styles.contributionWeekLast
                ]}
              >
                {week.map((date, dayIndex) => {
                  const year = date.getFullYear();
                  const month = date.getMonth();
                  const day = date.getDate();
                  const dateKey = formatDateKey(year, month, day);
                  const completionCount = getCompletionCount(dateKey);
                  const completionColor = getCompletionColor(completionCount, completionsPerDay, habit.color);
                  
                  return (
                    <View
                      key={dayIndex}
                      style={[
                        styles.contributionSquare,
                        dayIndex === 6 && styles.contributionSquareLast,
                        { backgroundColor: completionColor },
                      ]}
                    />
                  );
                })}
              </View>
              ))}
            </View>
          </Pressable>
        </ScrollView>
      </View>

      {/* Calendar - Animated */}
      <Animated.View 
        style={[
          styles.calendarContainer,
          { 
            maxHeight: calendarHeightInterpolation,
            opacity: calendarHeight,
          }
        ]}
      >
        <View style={styles.calendarContent}>
          {/* Calendar Navigation */}
          <View style={styles.calendarHeader}>
            <Pressable 
              onPress={(e) => {
                e.stopPropagation();
                navigateMonth('prev');
              }} 
              style={styles.navButton}
            >
              <FontAwesome6 name="chevron-left" size={20} color="#ffffff" />
            </Pressable>
            <Text style={styles.monthYear}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            <Pressable 
              onPress={(e) => {
                e.stopPropagation();
                navigateMonth('next');
              }} 
              style={styles.navButton}
            >
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
          const completionCount = getCompletionCount(dateKey);
          const isCompleted = completionCount >= completionsPerDay;
          const isTodayDate = isToday(currentYear, currentMonth, day);
          const completionColor = getCompletionColor(completionCount, completionsPerDay, habit.color);

          return (
            <Pressable
              key={day}
              style={[
                styles.dateCell,
                isTodayDate && { borderWidth: 2, borderColor: habit.color },
                completionCount > 0 && { backgroundColor: completionColor },
              ]}
              onPress={(e) => {
                e.stopPropagation();
                handleDatePress(day);
              }}
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
              {completionsPerDay > 1 && completionCount > 0 && (
                <Text style={styles.completionProgressText}>
                  {completionCount}/{completionsPerDay}
                </Text>
              )}
            </Pressable>
          );
            })}
          </View>
        </View>
      </Animated.View>

      {/* Edit and Delete Buttons - Only show when calendar is expanded */}
      {isCalendarExpanded && (
        <View style={styles.actionButtons}>
          <View style={{ flex: 1, marginHorizontal: 4 }}>
            <Pressable 
              onPress={() => onEdit && onEdit(habit)}
              style={[styles.actionButton, styles.editButton]}
            >
              <FontAwesome6 name="pen" size={16} color="#ffffff" style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Edit</Text>
            </Pressable>
          </View>
          <View style={{ flex: 1, marginHorizontal: 4 }}>
            <Pressable 
              onPress={() => onDelete && onDelete(habit.id)}
              style={[styles.actionButton, styles.deleteButton]}
            >
              <FontAwesome6 name="trash" size={16} color="#ffffff" style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Delete</Text>
            </Pressable>
          </View>
        </View>
      )}
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
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  checkButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
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
  contributionContainer: {
    marginBottom: 20,
  },
  contributionScrollContent: {
    paddingRight: 16,
  },
  contributionGridWrapper: {
    flexDirection: 'row',
  },
  contributionGrid: {
    flexDirection: 'row',
  },
  contributionWeek: {
    flexDirection: 'column',
    marginRight: 4,
  },
  contributionWeekLast: {
    marginRight: 0,
  },
  contributionSquare: {
    width: 12,
    height: 12,
    borderRadius: 3,
    backgroundColor: '#404040',
    marginBottom: 4,
  },
  contributionSquareLast: {
    marginBottom: 0,
  },
  calendarContainer: {
    overflow: 'hidden',
  },
  calendarContent: {
    paddingTop: 0,
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
    position: 'relative',
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
  completionProgressText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '600',
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  checkIcon: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: -4,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#3b82f6',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonIcon: {
    marginRight: 0,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

