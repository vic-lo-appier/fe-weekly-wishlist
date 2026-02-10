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
  if (votes > 8) {
    return {
      color: 'text-amber-400',
      glow: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]',
      badge: '🔥',
      label: 'HOT',
    };
  }
  if (votes >= 6) {
    return {
      color: 'text-orange-400',
      glow: 'drop-shadow-[0_0_6px_rgba(251,146,60,0.4)]',
      badge: '💥',
      label: 'Hot',
    };
  }
  if (votes >= 3) {
    return {
      color: 'text-purple-400',
      glow: 'drop-shadow-[0_0_4px_rgba(192,132,252,0.4)]',
      badge: '⭐',
      label: 'Popular',
    };
  }
  return {
    color: 'text-slate-500',
    glow: '',
    badge: '',
    label: '',
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
  const showVoted = !isAdmin && isVoted;

  return (
    <div
      className={`flex items-start p-3 sm:p-4 hover:bg-white/5 transition-colors gap-3 ${
        wish.isTemp ? 'opacity-60 animate-pulse' : ''
      } ${isDeleting ? 'opacity-50 bg-red-500/5 animate-pulse' : ''}`}
    >
      {/* 票數區域 */}
      <div className="w-12 sm:w-14 text-center shrink-0 self-center">
        <span
          className={`block font-black whitespace-nowrap transition-all text-base ${
            isDeleting
              ? 'text-red-400'
              : wish.isTemp
                ? 'text-slate-500'
                : `${voteStyle.color} ${voteStyle.glow}`
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
      <div className="flex-1 min-w-0 py-0.5">
        <h3
          title={wish.title}
          className={`font-bold text-sm line-clamp-2 ${
            isDeleting ? 'text-slate-400 line-through' : 'text-slate-200'
          }`}
        >
          {wish.title}
        </h3>
        <p title={wish.desc} className="text-xs text-slate-400 line-clamp-2 mt-0.5">
          {wish.desc || '無描述'}
        </p>
      </div>

      {/* 右側操作欄 */}
      {!isProcessing && (
        <div className="flex flex-col items-end shrink-0">
          {/* 編輯 & 刪除 */}
          {wish.isOwner && (
            <div className="flex items-center">
              <button
                onClick={onEdit}
                className="p-1 rounded text-slate-500 hover:text-yellow-400 transition-colors"
                title="編輯"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={onDelete}
                className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors"
                title="刪除"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
          {/* 按讚按鈕 — 撐滿剩餘高度 */}
          <button
            onClick={onVote}
            disabled={isVoteDisabled}
            className={`flex flex-col items-center justify-center gap-1 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
              isVoting
                ? 'text-slate-600 cursor-not-allowed'
                : showVoted
                  ? 'text-indigo-400 bg-indigo-500/15 cursor-not-allowed'
                  : 'text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10'
            }`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill={showVoted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
            </svg>
            <span>{isVoting ? '...' : showVoted ? '已推' : '推'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
