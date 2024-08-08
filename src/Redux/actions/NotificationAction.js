import { showNotification, hideNotification } from '../Slices/NotificationSlice.js';

export const showNotificationAction = (message, type) => {
  return showNotification({ message, type });
};

export const hideNotificationAction = () => {
  return hideNotification();
};