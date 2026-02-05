import type { ToastState } from '../types';

interface ToastProps extends ToastState {}

export default function Toast({ msg, type }: ToastProps) {
  return (
    <div
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-bold shadow-2xl z-50 ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
      }`}
    >
      {msg}
    </div>
  );
}
