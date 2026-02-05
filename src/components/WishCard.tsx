import type { Wish } from '../types';

interface WishCardProps {
  wish: Wish;
  isVoted: boolean;
  isDeleting: boolean;
  isVoting: boolean;
  isAdmin: boolean;
  onVote: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * 根據票數取得對應的樣式（適用於約 16 人的團隊）
 */
function getVoteStyle(votes: number) {
  if (votes >= 8) {
    // 超過一半人投票 → 超級熱門
    return {
      color: 'text-amber-400',
      size: 'text-2xl',
      glow: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]',
      badge: '🔥',
      label: 'HOT',
    };
  }
  if (votes >= 5) {
    // 約 1/3 人投票 → 熱門
    return {
      color: 'text-purple-400',
      size: 'text-xl',
      glow: 'drop-shadow-[0_0_4px_rgba(192,132,252,0.4)]',
      badge: '⭐',
      label: 'Popular',
    };
  }
  if (votes >= 3) {
    // 有點關注
    return {
      color: 'text-indigo-400',
      size: 'text-xl',
      glow: '',
      badge: '',
      label: 'Votes',
    };
  }
  return {
    color: 'text-slate-500',
    size: 'text-xl',
    glow: '',
    badge: '',
    label: 'Votes',
  };
}

export default function WishCard({
  wish,
  isVoted,
  isDeleting,
  isVoting,
  isAdmin,
  onVote,
  onEdit,
  onDelete,
}: WishCardProps) {
  const isProcessing = wish.isTemp || isDeleting;
  const isVoteDisabled = (!isAdmin && isVoted) || isProcessing || isVoting;
  const voteStyle = getVoteStyle(wish.votes);

  return (
    <div
      className={`flex items-center p-4 hover:bg-white/5 transition-colors gap-4 ${
        wish.isTemp ? 'opacity-60 animate-pulse' : ''
      } ${isDeleting ? 'opacity-50 bg-red-500/5 animate-pulse' : ''}`}
    >
      {/* 票數區域 */}
      <div className="w-14 text-center border-r border-white/10 pr-2 shrink-0">
        <span
          className={`block font-black transition-all ${
            isDeleting
              ? 'text-red-400 text-xl'
              : wish.isTemp
                ? 'text-slate-500 text-xl'
                : isVoted
                  ? `${voteStyle.color} ${voteStyle.size} ${voteStyle.glow}`
                  : `${voteStyle.color} ${voteStyle.size} ${voteStyle.glow}`
          }`}
        >
          {isDeleting ? '🗑️' : wish.isTemp ? '⏳' : `${voteStyle.badge}${wish.votes}`}
        </span>
        <span className={`text-[9px] uppercase tracking-tighter ${
          wish.votes >= 10 ? voteStyle.color : 'text-slate-600'
        }`}>
          {isDeleting ? '刪除中' : wish.isTemp ? '處理中' : voteStyle.label}
        </span>
      </div>

      {/* 內容區域 */}
      <div className="flex-grow min-w-0">
        <div className="flex items-start gap-2">
          <h3
            className={`font-bold text-sm line-clamp-2 flex-grow ${
              isDeleting ? 'text-slate-400 line-through' : 'text-slate-200'
            }`}
          >
            {wish.title}
          </h3>
          {wish.isTemp && (
            <span className="text-[10px] text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
              送出中...
            </span>
          )}
          {isDeleting && (
            <span className="text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
              刪除中...
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
          {wish.desc || '無描述'}
        </p>
      </div>

      {/* 操作按鈕區 */}
      <div className="flex items-center gap-2 shrink-0">
        {/* 編輯 & 刪除按鈕 */}
        {wish.isOwner && !isProcessing && (
          <>
            <button
              onClick={onEdit}
              className="p-2 rounded-lg text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 transition-all"
              title="編輯"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
              title="刪除"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </>
        )}

        {/* 投票按鈕 */}
        <button
          onClick={onVote}
          disabled={isVoteDisabled}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all
          ${
            isProcessing || isVoting || (!isAdmin && isVoted)
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
          }`}
        >
          {isDeleting
            ? '刪除中'
            : wish.isTemp
              ? '處理中'
              : isVoting
                ? '投票中...'
                : !isAdmin && isVoted
                  ? '已推'
                  : '推一波'}
        </button>
      </div>
    </div>
  );
}
