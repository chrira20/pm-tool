/**
 * Toast-Benachrichtigungssystem
 * Zeigt kurze Rückmeldungen am unteren Bildschirmrand.
 */

import { useState, useCallback, useRef } from 'react';
import { ToastContext } from './ToastContext';

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
  undo: '↩',
  redo: '↪',
  save: '💾',
  delete: '🗑',
};

const COLORS = {
  success: 'bg-green-600',
  error: 'bg-red-600',
  info: 'bg-slate-700',
  warning: 'bg-amber-500',
  undo: 'bg-amber-600',
  redo: 'bg-amber-600',
  save: 'bg-blue-600',
  delete: 'bg-red-600',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const addToast = useCallback((message, type = 'info', duration = 2500) => {
    // Deduplizierung: gleiche Nachricht nicht mehrfach gleichzeitig anzeigen
    setToasts((prev) => {
      if (prev.some((t) => t.message === message)) return prev;
      const id = ++idRef.current;
      setTimeout(() => {
        setToasts((p) => p.filter((t) => t.id !== id));
      }, duration);
      return [...prev.slice(-4), { id, message, type }];
    });
  }, []);

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Toast-Container */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-xl text-white text-sm font-medium
              ${COLORS[toast.type] || COLORS.info}
              animate-[slideUp_0.25s_ease-out]`}
          >
            <span className="text-base">{ICONS[toast.type] || ICONS.info}</span>
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// useToast Hook ist in ./useToast.js ausgelagert (Vite Fast Refresh Kompatibilität)
