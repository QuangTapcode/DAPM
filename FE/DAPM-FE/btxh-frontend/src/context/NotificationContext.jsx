import { createContext, useState, useCallback } from 'react';

export const NotificationContext = createContext(null);

let idCounter = 0;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++idCounter;
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, duration);
  }, []);

  const notify = {
    success: (msg) => addNotification(msg, 'success'),
    error: (msg) => addNotification(msg, 'error'),
    info: (msg) => addNotification(msg, 'info'),
    warning: (msg) => addNotification(msg, 'warning'),
  };

  return (
    <NotificationContext.Provider value={{ notifications, notify }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`px-4 py-3 rounded shadow text-white text-sm ${
              n.type === 'success' ? 'bg-green-600' :
              n.type === 'error'   ? 'bg-red-600' :
              n.type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-600'
            }`}
          >
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
