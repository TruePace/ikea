
import { useSelector, useDispatch } from 'react-redux';
import { getNotificationMessage, getNotificationType, getNotificationVisibility } from './Selectors/NotificationSelector.js';
import { showNotificationAction, hideNotificationAction } from './actions/NotificationAction.js';

const NotifyFakeExample = () => {
  const message = useSelector(getNotificationMessage);
  const type = useSelector(getNotificationType);
  const isVisible = useSelector(getNotificationVisibility);
  const dispatch = useDispatch();

  const handleShowNotification = () => {
    dispatch(showNotificationAction('This is a notification', 'success'));
  };

  const handleHideNotification = () => {
    dispatch(hideNotificationAction());
  };

  return (
    <div>
      {isVisible && (
        <div className={`notification ${type}`}>
          {message}
        </div>
      )}
      <button onClick={handleShowNotification}>Show Notification</button>
      <button onClick={handleHideNotification}>Hide Notification</button>
    </div>
  );
};

export default NotifyFakeExample;