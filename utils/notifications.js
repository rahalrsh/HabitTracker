import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Day mapping: 'Mon' -> 1, 'Tue' -> 2, etc. (JavaScript Date: 0=Sunday, 1=Monday, etc.)
const DAY_MAP = {
  'Sun': 0,
  'Mon': 1,
  'Tue': 2,
  'Wed': 3,
  'Thu': 4,
  'Fri': 5,
  'Sat': 6,
};

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: false,
      },
    });
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') {
    console.warn('Notification permissions not granted');
    return false;
  }
  
  // Configure notification channel for Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#22c55e',
    });
  }
  
  return true;
}

/**
 * Parse time string like "10:00 AM" to { hours, minutes }
 */
function parseTimeString(timeString) {
  const [timePart, period] = timeString.split(' ');
  const [hours, minutes] = timePart.split(':').map(Number);
  let hours24 = hours;
  
  if (period === 'PM' && hours !== 12) hours24 += 12;
  if (period === 'AM' && hours === 12) hours24 = 0;
  
  return { hours: hours24, minutes };
}

/**
 * Generate notification identifier for a specific habit reminder and day
 */
function getNotificationId(habitId, reminderId, day) {
  return `habit-${habitId}-reminder-${reminderId}-day-${day}`;
}

/**
 * Schedule notifications for a single reminder
 */
async function scheduleReminderNotifications(habitId, habitName, reminder) {
  const { hours, minutes } = parseTimeString(reminder.time);
  const days = reminder.days || [];
  const notificationIds = [];
  
  for (const dayAbbr of days) {
    const weekday = DAY_MAP[dayAbbr];
    if (weekday === undefined) continue;
    
    const notificationId = getNotificationId(habitId, reminder.id, dayAbbr);
    
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: notificationId,
        content: {
          title: habitName,
          body: `Time to complete your habit!`,
          sound: true,
          data: { habitId, reminderId: reminder.id, day: dayAbbr },
        },
        trigger: {
          type: 'weekly',
          weekday: weekday + 1, // Weekly trigger uses 1-7 (Sunday = 1, Monday = 2, etc.)
          hour: hours,
          minute: minutes,
        },
      });
      
      notificationIds.push(notificationId);
    } catch (error) {
      console.error(`Error scheduling notification for ${dayAbbr}:`, error);
    }
  }
  
  return notificationIds;
}

/**
 * Cancel all notifications for a specific reminder
 */
export async function cancelReminderNotifications(habitId, reminderId) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const notificationIds = days.map(day => getNotificationId(habitId, reminderId, day));
  
  try {
    // Check if the function is available
    if (typeof Notifications.cancelScheduledNotificationAsync !== 'function') {
      console.warn('cancelScheduledNotificationAsync is not available');
      return;
    }
    
    // Cancel each notification individually
    for (const notificationId of notificationIds) {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      } catch (err) {
        // Ignore errors for individual cancellations (notification might not exist)
        console.warn(`Failed to cancel notification ${notificationId}:`, err.message);
      }
    }
    console.log(`Cancelled notifications for reminder ${reminderId}`);
  } catch (error) {
    console.error('Error cancelling reminder notifications:', error);
  }
}

/**
 * Cancel all notifications for a habit (all reminders)
 */
export async function cancelAllHabitNotifications(habitId) {
  try {
    // Get all scheduled notifications
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Filter notifications that belong to this habit
    const habitNotificationIds = scheduledNotifications
      .filter(notif => {
        const id = notif.identifier || '';
        return id.startsWith(`habit-${habitId}-`);
      })
      .map(notif => notif.identifier);
    
    if (habitNotificationIds.length > 0) {
      // Check if the function is available
      if (typeof Notifications.cancelScheduledNotificationAsync !== 'function') {
        console.warn('cancelScheduledNotificationAsync is not available');
        return;
      }
      
      // Cancel each notification individually
      for (const notificationId of habitNotificationIds) {
        try {
          await Notifications.cancelScheduledNotificationAsync(notificationId);
        } catch (err) {
          // Ignore errors for individual cancellations (notification might not exist)
          console.warn(`Failed to cancel notification ${notificationId}:`, err.message);
        }
      }
      console.log(`Cancelled ${habitNotificationIds.length} notifications for habit ${habitId}`);
    }
  } catch (error) {
    console.error('Error cancelling habit notifications:', error);
  }
}

/**
 * Schedule all notifications for a habit's reminders
 */
export async function scheduleHabitNotifications(habit) {
  if (!habit.reminders || habit.reminders.length === 0) {
    return;
  }
  
  // First, cancel all existing notifications for this habit
  await cancelAllHabitNotifications(habit.id);
  
  // Schedule new notifications for each reminder
  for (const reminder of habit.reminders) {
    if (reminder.days && reminder.days.length > 0) {
      await scheduleReminderNotifications(habit.id, habit.name, reminder);
    }
  }
  
  console.log(`Scheduled notifications for habit: ${habit.name}`);
}

/**
 * Initialize notifications (request permissions)
 */
export async function initializeNotifications() {
  return await requestNotificationPermissions();
}

