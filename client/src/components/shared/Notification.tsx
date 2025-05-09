// src/components/common/Notification.tsx
import { useNotification } from '../../context/NotificationContext';

const Notification = () => {
  const { notification, clearNotification } = useNotification();

  if (!notification) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[notification.type];

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg`}>
      {notification.message}
      <button 
        onClick={clearNotification}
        className="ml-2 font-bold"
      >
        ×
      </button>
    </div>
  );
};

export default Notification;