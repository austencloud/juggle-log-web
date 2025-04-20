import { writable } from 'svelte/store';
import { nanoid } from 'nanoid';

export interface Notification {
  id: string;
  message: string;
  type: 'achievement' | 'level' | 'streak' | 'challenge' | 'info';
  duration: number;
  timestamp: number;
  data?: any;
}

export const notificationStore = writable<Notification[]>([]);

export function addNotification(
  message: string,
  type: 'achievement' | 'level' | 'streak' | 'challenge' | 'info',
  duration = 5000,
  data?: any
) {
  const notification = {
    id: nanoid(),
    message,
    type,
    duration,
    timestamp: Date.now(),
    data
  };
  
  notificationStore.update(notifications => [notification, ...notifications]);
  
  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      clearNotification(notification.id);
    }, duration);
  }
  
  return notification.id;
}

export function clearNotification(id: string) {
  notificationStore.update(notifications => 
    notifications.filter(n => n.id !== id)
  );
}

export function clearAllNotifications() {
  notificationStore.set([]);
}