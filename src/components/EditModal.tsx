import type { Wish } from '../types';

interface EditModalProps {
  wish: Wish | null;
  isSaving: boolean;
  onTitleChange: (value: string) => void;
  onDescChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export default function EditModal({
  wish,
  isSaving,
  onTitleChange,
  onDescChange,
  onSave,
  onCancel,
}: EditModalProps) {
  if (!wish) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
        <h2 className="text-xl font-bold mb-4 text-blue-400">編輯提案</h2>
        <div className="space-y-4">
          <input
            value={wish.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
          />
          <textarea
            value={wish.desc}
            onChange={(e) => onDescChange(e.target.value)}
            className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm h-32 focus:outline-none focus:border-indigo-500"
          />
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              disabled={isSaving}
              className={`flex-1 py-3 rounded-lg font-bold text-sm ${
                isSaving
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              取消
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className={`flex-1 py-3 rounded-lg font-bold text-sm text-white ${
                isSaving
                  ? 'bg-indigo-800 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500'
              }`}
            >
              {isSaving ? '儲存中...' : '儲存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
