import type { Wish } from '../types';

interface DeleteModalProps {
  wish: Wish;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({ wish, onConfirm, onCancel }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-sm shadow-2xl text-center">
        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2 text-white">確定要刪除嗎？</h2>
        <p className="text-slate-400 text-sm mb-6">
          您即將刪除「
          <span className="text-slate-200 font-semibold">{wish.title}</span>
          」，此動作無法復原。
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-slate-800 rounded-lg font-bold text-sm hover:bg-slate-700 transition-colors"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-600 rounded-lg font-bold text-sm text-white hover:bg-red-500 transition-all active:scale-95 shadow-lg shadow-red-600/20"
          >
            確認刪除
          </button>
        </div>
      </div>
    </div>
  );
}
