interface WishFormProps {
  title: string;
  desc: string;
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onDescChange: (value: string) => void;
  onSubmit: () => void;
}

export default function WishForm({
  title,
  desc,
  isSubmitting,
  onTitleChange,
  onDescChange,
  onSubmit,
}: WishFormProps) {
  const isDisabled = isSubmitting || !title.trim();

  return (
    <section className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl mb-8 shadow-xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-grow space-y-2">
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="主題名稱..."
            className="w-full bg-black/20 border border-indigo-500/30 p-2 text-sm rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
          />
          <input
            value={desc}
            onChange={(e) => onDescChange(e.target.value)}
            placeholder="想聽什麼？"
            className="w-full bg-black/20 border border-indigo-500/30 p-2 text-sm rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
          />
        </div>
        <button
          onClick={onSubmit}
          disabled={isDisabled}
          className={`px-8 py-2 rounded-lg font-bold transition-all text-sm h-auto sm:h-20 ${
            isDisabled
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 active:scale-95'
          }`}
        >
          {isSubmitting ? '許願中...' : '許願'}
        </button>
      </div>
    </section>
  );
}
