/**
 * Kontextmenü-Komponente
 * Zeigt ein Rechtsklick-Menü an einer bestimmten Position.
 */

import { useEffect, useRef } from 'react';

/**
 * @param {{
 *   x: number,
 *   y: number,
 *   items: Array<{ label: string, icon?: string, onClick: () => void, danger?: boolean, disabled?: boolean } | 'separator'>,
 *   onClose: () => void
 * }} props
 */
export default function ContextMenu({ x, y, items, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    // Verzögert, damit der aktuelle Klick nicht direkt schließt
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler);
      document.addEventListener('contextmenu', handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('contextmenu', handler);
    };
  }, [onClose]);

  // Position anpassen, damit Menü nicht aus Bildschirm ragt
  useEffect(() => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (rect.right > vw - 8) {
      ref.current.style.left = `${x - rect.width}px`;
    }
    if (rect.bottom > vh - 8) {
      ref.current.style.top = `${y - rect.height}px`;
    }
  }, [x, y]);

  return (
    <div
      ref={ref}
      className="fixed z-[300] bg-white border border-slate-200 rounded-lg shadow-xl py-1 min-w-[160px]"
      style={{
        left: x,
        top: y,
        animation: 'fadeIn 0.12s ease-out',
      }}
    >
      {items.map((item, i) => {
        if (item === 'separator') {
          return <div key={i} className="my-1 border-t border-slate-100" />;
        }
        return (
          <button
            key={i}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors
              ${item.disabled ? 'text-slate-300 cursor-not-allowed' : ''}
              ${item.danger && !item.disabled ? 'text-red-600 hover:bg-red-50' : ''}
              ${!item.danger && !item.disabled ? 'text-slate-700 hover:bg-slate-50' : ''}`}
          >
            {item.icon && <span className="text-base w-5 text-center">{item.icon}</span>}
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
