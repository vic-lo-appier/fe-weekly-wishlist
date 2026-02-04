/// <reference path="./canvas-confetti.d.ts" />
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

interface Wish {
  id: string;
  votes: number;
  title: string;
  desc: string;
  isOwner: boolean;
  isTemp?: boolean; // 用於樂觀更新的暫時標記
}

interface ToastState {
  msg: string;
  type: 'success' | 'error';
}

// 模擬 Toast 提示組件
const Toast = ({ msg, type }: ToastState) => (
  <div
    className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-bold shadow-2xl z-50 ${type === 'error' ? 'bg-red-500' : 'bg-green-500'
      }`}
  >
    {msg}
  </div>
);

function App() {

  const [wishes, setWishes] = useState<Wish[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Wish | null>(null);
  const [editingWish, setEditingWish] = useState<Wish | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWish, setNewWish] = useState({ title: '', desc: '' });
  // 顯示提示訊息
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 初始化載入
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    // GAS 呼叫流程：獲取投票紀錄 -> 獲取主題
    google.script.run
      .withSuccessHandler((ids) => {
        setVotedIds(new Set(ids));
        google.script.run
          .withSuccessHandler((data) => {
            setWishes(data);
            setLoading(false);
          })
          .getWishes();
      })
      .getUserVotedThemes();
  };

  // 1. 新增主題 (樂觀更新)
  const handleAddWish = (title: string, desc: string) => {
    const uuid = crypto.randomUUID(); // 產生唯一 ID

    const newWishData: Wish = {
      id: uuid,
      title,
      desc,
      votes: 1,       // 🔥 關鍵點：這裡直接給 1，畫面上就會立刻顯示 1 票
      isOwner: true,  // 自己發的，當然是 Owner
      isTemp: true    // 標記為處理中，可以加個轉圈圈或半透明效果
    };

    // 1. 立即更新列表 (Optimistic Update)
    setWishes(prev => [newWishData, ...prev]);

    // 2. 立即標記為「已投票」，這樣按鈕會立刻變色且無法再點
    setVotedIds(prev => new Set(prev).add(uuid));

    // 3. 呼叫後端 API
    google.script.run
      .withSuccessHandler(() => {
        // 成功後，把 isTemp 標記拿掉即可，票數維持 1
        setWishes(prev =>
          prev.map(w => w.id === uuid ? { ...w, isTemp: false } : w)
        );
      })
      .withFailureHandler((err) => {
        // 失敗才把這個假願望從畫面上移除，並退回投票狀態
        setWishes(prev => prev.filter(w => w.id !== uuid));
        setVotedIds(prev => {
          const next = new Set(prev);
          next.delete(uuid);
          return next;
        });
        showToast("發生錯誤：" + err.message, "error");
      })
      .addNewWish({ id: uuid, title, desc });
  };

  // 2. 投票 (樂觀更新)
  const handleVote = (id: string) => {
    if (votedIds.has(id)) return;

    const previousWishes = [...wishes];
    const previousVoted = new Set(votedIds);

    // 立即更新 UI
    setWishes((prev) =>
      prev.map((w) => (w.id === id ? { ...w, votes: (w.votes || 0) + 1 } : w))
    );
    setVotedIds((prev) => new Set(prev).add(id));
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#3b82f6'], // 配合你的藍紫色調
    });
    google.script.run
      .withSuccessHandler(() => {
        showToast('投票成功');
      })
      .withFailureHandler((err) => {
        setWishes(previousWishes);
        setVotedIds(previousVoted);
        showToast(err.message, 'error');
      })
      .addVote(id);
  };

  // 3. 更新主題 (樂觀更新)
  const handleUpdate = () => {
    if (!editingWish) return;

    const previousWishes = [...wishes];
    setWishes((prev) =>
      prev.map((w) => (w.id === editingWish.id ? editingWish : w))
    );
    setIsModalOpen(false);

    google.script.run
      .withSuccessHandler(() => showToast('更新成功'))
      .withFailureHandler((err) => {
        setWishes(previousWishes);
        showToast(err.message, 'error');
      })
      .updateWish(editingWish);
  };

  // 4. 刪除主題 (樂觀更新)
  const executeDelete = () => {
    if (!deleteTarget) return;

    const { id } = deleteTarget;
    const previousWishes = [...wishes];
    setWishes((prev) => prev.filter((w) => w.id !== id));
    setDeleteTarget(null); // 關閉彈窗

    google.script.run
      .withSuccessHandler(() => showToast('已成功刪除提案'))
      .withFailureHandler((err) => {
        setWishes(previousWishes);
        showToast(err.message, 'error');
      })
      .deleteWish(id);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 text-slate-200">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-blue-400">
            FE Weekly <span className="text-white">許願池</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time React SPA on Google Apps Script
          </p>
        </div>
        {loading && (
          <div className="text-xs text-indigo-400 animate-pulse">同步中...</div>
        )}
      </header>

      {/* 新增區塊 */}
      <section className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-grow space-y-2">
            <input
              value={newWish.title}
              onChange={(e) =>
                setNewWish({ ...newWish, title: e.target.value })
              }
              placeholder="主題名稱..."
              className="w-full bg-black/20 border border-indigo-500/30 p-2 text-sm rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
            />
            <input
              value={newWish.desc}
              onChange={(e) => setNewWish({ ...newWish, desc: e.target.value })}
              placeholder="想聽什麼？"
              className="w-full bg-black/20 border border-indigo-500/30 p-2 text-sm rounded-lg focus:outline-none focus:border-indigo-400 transition-all"
            />
          </div>
          <button
            onClick={() => handleAddWish(newWish.title, newWish.desc)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-2 rounded-lg font-bold hover:scale-105 active:scale-95 transition-all text-sm h-auto sm:h-20"
          >
            許願
          </button>
        </div>
      </section>

      {/* 列表區塊 */}
      <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
        {wishes
          .sort((a, b) => b.votes - a.votes)
          .map((wish) => (
            <div
              key={wish.id}
              className="flex items-center p-4 hover:bg-white/5 transition-colors gap-4"
            >
              <div className="w-14 text-center border-r border-white/10 pr-2 shrink-0">
                <span
                  className={`block text-xl font-black ${votedIds.has(wish.id) ? 'text-indigo-400' : 'text-slate-500'
                    }`}
                >
                  {wish.votes}
                </span>
                <span className="text-[9px] uppercase tracking-tighter text-slate-600">
                  Votes
                </span>
              </div>

              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-200 truncate text-sm">
                    {wish.title}
                  </h3>
                  {wish.isOwner && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingWish(wish);
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-slate-500 hover:text-yellow-400 transition-colors"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() =>
                          setDeleteTarget(wish)
                        }
                        className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {wish.desc || '無描述'}
                </p>
              </div>

              <button
                onClick={() => handleVote(wish.id)}
                disabled={votedIds.has(wish.id) || wish.isTemp}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0
                ${votedIds.has(wish.id)
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  }`}
              >
                {votedIds.has(wish.id) ? '已推' : '推一波'}
              </button>
            </div>
          ))}
      </section>

      {wishes.length === 0 && !loading && (
        <div className="p-20 text-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
          目前還沒有人許願，快來當第一個提案人吧！🚀
        </div>
      )}

      {/* 編輯 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-blue-400">編輯提案</h2>
            <div className="space-y-4">
              <input
                value={editingWish?.title || ''}
                onChange={(e) =>
                  editingWish && setEditingWish({ ...editingWish, title: e.target.value })
                }
                className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm focus:outline-none focus:border-indigo-500"
              />
              <textarea
                value={editingWish?.desc || ''}
                onChange={(e) =>
                  editingWish && setEditingWish({ ...editingWish, desc: e.target.value })
                }
                className="w-full bg-black/40 border border-white/10 p-3 rounded-lg text-sm h-32 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 rounded-lg font-bold text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 py-3 bg-indigo-600 rounded-lg font-bold text-sm text-white hover:bg-indigo-500"
                >
                  儲存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 刪除確認 Modal */}
      {deleteTarget && (
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
            <h2 className="text-xl font-bold mb-2 text-white">
              確定要刪除嗎？
            </h2>
            <p className="text-slate-400 text-sm mb-6">
              您即將刪除「
              <span className="text-slate-200 font-semibold">
                {deleteTarget.title}
              </span>
              」，此動作無法復原。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-3 bg-slate-800 rounded-lg font-bold text-sm hover:bg-slate-700 transition-colors"
              >
                取消
              </button>
              <button
                onClick={executeDelete}
                className="flex-1 py-3 bg-red-600 rounded-lg font-bold text-sm text-white hover:bg-red-500 transition-all active:scale-95 shadow-lg shadow-red-600/20"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

export default App;
