import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { Bell, X, Info } from 'lucide-react';

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { user, token } = useSelector((state) => state.auth);
  const [socket, setSocket] = useState(null);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to backend server url
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      query: {
        userId: user.id || user._id,
        role: user.role,
        department: user.department || ''
      }
    });

    setSocket(newSocket);

    // Event listeners
    newSocket.on('notification', (data) => {
      addToast(data.message, data.type || 'info');
    });

    newSocket.on('new-assignment', (data) => {
      addToast(`New Assignment: "${data.title}" posted for ${data.courseCode}`, 'info');
    });

    newSocket.on('submission-graded', (data) => {
      addToast(`Your submission for "${data.title}" has been graded! Score: ${data.grade}/100`, 'success');
    });

    newSocket.on('new-notice', (data) => {
      addToast(`New Notice Board Post: ${data.title}`, 'info');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [token, user]);

  return (
    <SocketContext.Provider value={{ socket, addToast }}>
      {children}
      
      {/* Toast Overlay Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-xl border animate-slide-in bg-white/95 backdrop-blur-md transition-all duration-300 ${
              toast.type === 'success'
                ? 'border-emerald-200 bg-emerald-50/95 text-emerald-900'
                : toast.type === 'error'
                ? 'border-rose-200 bg-rose-50/95 text-rose-900'
                : 'border-indigo-200 bg-indigo-50/95 text-indigo-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl shrink-0 ${
              toast.type === 'success'
                ? 'bg-emerald-100 text-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-indigo-100 text-indigo-700'
            }`}>
              {toast.type === 'success' ? <Bell className="h-4 w-4 animate-bounce" /> : <Info className="h-4 w-4" />}
            </div>
            
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-650 transition-colors p-0.5 rounded-lg shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </SocketContext.Provider>
  );
};
