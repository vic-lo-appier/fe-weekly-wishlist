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
      size: 'text-2xl',
      glow: 'drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]',
      badge: '🔥',
      label: 'HOT',
    };
  }
  if (votes >= 6) {
    return {
      color: 'text-orange-400',
      size: 'text-xl',
      glow: 'drop-shadow-[0_0_6px_rgba(251,146,60,0.4)]',
      badge: '💥',
      label: 'Hot',
    };
  }
  if (votes >= 3) {
    return {
      color: 'text-purple-400',
      size: 'text-xl',
      glow: 'drop-shadow-[0_0_4px_rgba(192,132,252,0.4)]',
      badge: '⭐',
      label: 'Popular',
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
      <div className="min-w-16 text-center border-r border-white/10 pr-3 shrink-0">
        <span
          className={`block font-black whitespace-nowrap transition-all ${
            isDeleting
              ? 'text-red-400 text-xl'
              : wish.isTemp
                ? 'text-slate-500 text-xl'
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
          {isVoting ? (
            '投票中...'
          ) : !isAdmin && isVoted ? (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-5.5l.92-4.65c.05-.22.02-.46-.08-.66a4.8 4.8 0 00-.88-1.22L14 2 7.59 8.41C7.21 8.79 7 9.3 7 9.83v7.84A2.33 2.33 0 009.34 20h8.11c.7 0 1.36-.37 1.72-.97l2.66-6.15z" />
              </svg>
              已推
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
              </svg>
              推
            </>
          )}
        </button>
      </div>
    </div>
  );
}
