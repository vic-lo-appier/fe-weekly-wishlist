/// <reference path="./canvas-confetti.d.ts" />
import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Wish, ToastState } from './types';
import {
  Toast,
  WishForm,
  WishCard,
  EditModal,
  DeleteModal,
} from './components';

function App() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [votedIds, setVotedIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<Wish | null>(null);
  const [editingWish, setEditingWish] = useState<Wish | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWish, setNewWish] = useState({ title: '', desc: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [votingIds, setVotingIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    google.script.run
      .withSuccessHandler((adminStatus) => {
        setIsAdmin(adminStatus);
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
      })
      .isAdmin();
  };

  const handleAddWish = (title: string, desc: string) => {
    if (isSubmitting || !title.trim()) return;

    setIsSubmitting(true);
    setNewWish({ title: '', desc: '' });

    const uuid = crypto.randomUUID();
    const newWishData: Wish = {
      id: uuid,
      title,
      desc,
      votes: 1,
      isOwner: true,
      isTemp: true,
    };

    setWishes((prev) => [newWishData, ...prev]);
    setVotedIds((prev) => new Set(prev).add(uuid));

    google.script.run
      .withSuccessHandler(() => {
        setWishes((prev) =>
          prev.map((w) => (w.id === uuid ? { ...w, isTemp: false } : w))
        );
        showToast('許願成功 🎉');
        setIsSubmitting(false);
      })
      .withFailureHandler((err) => {
        setWishes((prev) => prev.filter((w) => w.id !== uuid));
        setVotedIds((prev) => {
          const next = new Set(prev);
          next.delete(uuid);
          return next;
        });
        showToast('發生錯誤：' + err.message, 'error');
        setIsSubmitting(false);
      })
      .addNewWish({ id: uuid, title, desc });
  };

  const handleVote = (id: string) => {
    if (!isAdmin && votedIds.has(id)) return;
    if (votingIds.has(id)) return;

    const previousWishes = [...wishes];
    const previousVoted = new Set(votedIds);

    setVotingIds((prev) => new Set(prev).add(id));
    setWishes((prev) =>
      prev.map((w) => (w.id === id ? { ...w, votes: (w.votes || 0) + 1 } : w))
    );
    if (!isAdmin) {
      setVotedIds((prev) => new Set(prev).add(id));
    }

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#a855f7', '#3b82f6'],
    });

    google.script.run
      .withSuccessHandler(() => {
        setVotingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        showToast(isAdmin ? '(Admin) 投票成功' : '投票成功');
      })
      .withFailureHandler((err) => {
        setVotingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        setWishes(previousWishes);
        setVotedIds(previousVoted);
        showToast(err.message, 'error');
      })
      .addVote(id);
  };

  const handleUpdate = () => {
    if (!editingWish || isSaving) return;

    setIsSaving(true);
    const previousWishes = [...wishes];
    setWishes((prev) =>
      prev.map((w) => (w.id === editingWish.id ? editingWish : w))
    );

    google.script.run
      .withSuccessHandler(() => {
        setIsSaving(false);
        setIsModalOpen(false);
        setEditingWish(null);
        showToast('更新成功');
      })
      .withFailureHandler((err) => {
        setIsSaving(false);
        setWishes(previousWishes);
        showToast(err.message, 'error');
      })
      .updateWish(editingWish);
  };

  const executeDelete = () => {
    if (!deleteTarget) return;

    const { id } = deleteTarget;
    setDeletingIds((prev) => new Set(prev).add(id));
    setDeleteTarget(null);

    google.script.run
      .withSuccessHandler(() => {
        setWishes((prev) => prev.filter((w) => w.id !== id));
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        showToast('已成功刪除提案');
      })
      .withFailureHandler((err) => {
        setDeletingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        showToast(err.message, 'error');
      })
      .deleteWish(id);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 text-slate-200">
      {/* Header */}
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-blue-400">
            FE Weekly <span className="text-white">許願池</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            提出你想聽的分享主題，一起投票決定！
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {isAdmin && (
            <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
              🔧 Admin Mode
            </span>
          )}
          {loading && (
            <div className="text-xs text-indigo-400 animate-pulse">
              同步中...
            </div>
          )}
        </div>
      </header>

      {/* 新增表單 */}
      <WishForm
        title={newWish.title}
        desc={newWish.desc}
        isSubmitting={isSubmitting}
        onTitleChange={(value) => setNewWish({ ...newWish, title: value })}
        onDescChange={(value) => setNewWish({ ...newWish, desc: value })}
        onSubmit={() => handleAddWish(newWish.title, newWish.desc)}
      />

      {/* 載入中狀態 */}
      {loading && (
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-indigo-500/30 rounded-full"></div>
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
            </div>
            <div className="text-center">
              <p className="text-indigo-400 font-medium">載入中...</p>
              <p className="text-slate-500 text-xs mt-1">正在取得許願清單</p>
            </div>
          </div>
        </div>
      )}

      {/* 列表區塊 */}
      {!loading && wishes.length > 0 && (
        <section className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5">
          {wishes
            .sort((a, b) => b.votes - a.votes)
            .map((wish) => (
              <WishCard
                key={wish.id}
                wish={wish}
                isVoted={votedIds.has(wish.id)}
                isDeleting={deletingIds.has(wish.id)}
                isVoting={votingIds.has(wish.id)}
                isAdmin={isAdmin}
                onVote={() => handleVote(wish.id)}
                onEdit={() => {
                  setEditingWish(wish);
                  setIsModalOpen(true);
                }}
                onDelete={() => setDeleteTarget(wish)}
              />
            ))}
        </section>
      )}

      {/* 空狀態 */}
      {!loading && wishes.length === 0 && (
        <div className="p-20 text-center text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
          目前還沒有人許願，快來當第一個提案人吧！🚀
        </div>
      )}

      {/* 編輯 Modal */}
      {isModalOpen && (
        <EditModal
          wish={editingWish}
          isSaving={isSaving}
          onTitleChange={(value) =>
            editingWish && setEditingWish({ ...editingWish, title: value })
          }
          onDescChange={(value) =>
            editingWish && setEditingWish({ ...editingWish, desc: value })
          }
          onSave={handleUpdate}
          onCancel={() => setIsModalOpen(false)}
        />
      )}

      {/* 刪除確認 Modal */}
      {deleteTarget && (
        <DeleteModal
          wish={deleteTarget}
          onConfirm={executeDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

export default App;
