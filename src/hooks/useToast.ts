import { useState, useCallback, useRef } from 'react';
import type { ToastState } from '../types';

export function useToast(duration = 3000) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback(
    (msg: string, type: 'success' | 'error' = 'success') => {
      clearTimeout(timerRef.current);
      setToast({ msg, type });
      timerRef.current = setTimeout(() => setToast(null), duration);
    },
    [duration],
  );

  return { toast, showToast };
}
