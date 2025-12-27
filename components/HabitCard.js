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

export default function HabitCard({ habit, onToggleDate }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [isCalendarExpanded, setIsCalendarExpanded] = useState(false);
  const scrollViewRef = useRef(null);
  const calendarHeight = useRef(new Animated.Value(0)).current;
  const touchRef = useRef({ startX: 0, startY: 0, startTime: 0, isScrolling: false });

  const completions = habit.completions || {};

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

  const isTodayCompleted = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const dateKey = formatDateKey(year, month, day);
    return completions[dateKey] === true;
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
            { borderColor: habit.color },
            isTodayCompleted() && { backgroundColor: habit.color }
          ]}
        >
          <FontAwesome6 
            name="check" 
            size={20} 
            color={isTodayCompleted() ? "#ffffff" : habit.color} 
          />
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
                  const isCompleted = completions[dateKey] === true;
                  
                  return (
                    <View
                      key={dayIndex}
                      style={[
                        styles.contributionSquare,
                        dayIndex === 6 && styles.contributionSquareLast,
                        isCompleted && { backgroundColor: habit.color },
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
                </Pressable>
              );
            })}
          </View>
        </View>
      </Animated.View>
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

