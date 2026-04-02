/**
 * Hook für Toast-Benachrichtigungen.
 * Ausgelagert aus Toast.jsx für Vite Fast Refresh Kompatibilität
 * (nur Komponenten-Exports in Komponentendateien).
 */

import { useContext } from 'react';
import { ToastContext } from './ToastContext';

/** Hook: const toast = useToast(); toast('Gespeichert', 'success'); */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast muss innerhalb von <ToastProvider> verwendet werden');
  return ctx;
}
