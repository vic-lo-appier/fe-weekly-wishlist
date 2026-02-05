import type { Wish } from '../types';

type MockFunctionMap = {
  getWishes: (success: (data: Wish[]) => void) => void;
  getUserVotedThemes: (success: (ids: string[]) => void) => void;
  addNewWish: (data: { id: string; title: string; desc: string }, success: (message: string) => void) => void;
  addVote: (id: string, success: (message: string) => void) => void;
  deleteWish: (success: (message: string) => void, id: string) => void;
  updateWish: (data: Wish, success: (message: string) => void) => void;
  isAdmin: (success: (isAdmin: boolean) => void) => void;
};

const mockFunctions: MockFunctionMap = {
  getWishes: (success: (data: Wish[]) => void) => {
    console.log('Mock: getWishes');
    success([
      {
        id: '2',
        votes: 10,
        title: 'React 19 樂觀更新',
        desc: '這就是你現在看到的',
        isOwner: true,
      },
      {
        id: '3',
        votes: 5,
        title: 'Tailwind v4 實戰',
        desc: '真的很簡潔',
        isOwner: false,
      },
    ]);
  },
  getUserVotedThemes: (success: (ids: string[]) => void) => {
    console.log('Mock: getUserVotedThemes');
    success(['2']);
  },
  addNewWish: (data: { id: string; title: string; desc: string }, success: (message: string) => void) => {
    console.log('Mock: Add', data);
    success('許願成功');
  },
  addVote: (id: string, success: (message: string) => void) => {
    console.log('Mock: Vote', id);
    success('投票成功');
  },
  deleteWish: (success: (message: string) => void, id: string) => {
    console.log('Mock: Delete requested for ID', id);
    setTimeout(() => success('刪除成功'), 500);
  },
  updateWish: (data: Wish, success: (message: string) => void) => {
    console.log('Mock: Update', data);
    success('更新成功');
  },
  isAdmin: (success: (isAdmin: boolean) => void) => {
    console.log('Mock: isAdmin');
    success(true); // 本地開發預設為 Admin
  },
};

const createProxy = (
  successHandler: ((result: unknown) => void) | null = null,
  failureHandler: ((error: Error) => void) | null = null
): google.script.Runner => {
  const proxy = {
    withSuccessHandler: (handler: (result: unknown) => void) => createProxy(handler, failureHandler),
    withFailureHandler: (handler: (error: Error) => void) => createProxy(successHandler, handler),
    getWishes: () => {
      if (successHandler) {
        mockFunctions.getWishes(successHandler as (data: Wish[]) => void);
      }
    },
    getUserVotedThemes: () => {
      if (successHandler) {
        mockFunctions.getUserVotedThemes(successHandler as (ids: string[]) => void);
      }
    },
    addNewWish: (wish: { id: string; title: string; desc: string }) => {
      if (successHandler) {
        mockFunctions.addNewWish(wish, successHandler as (message: string) => void);
      }
    },
    addVote: (id: string) => {
      if (successHandler) {
        mockFunctions.addVote(id, successHandler as (message: string) => void);
      }
    },
    deleteWish: (id: string) => {
      if (successHandler) {
        mockFunctions.deleteWish(successHandler as (message: string) => void, id);
      }
    },
    updateWish: (wish: Wish) => {
      if (successHandler) {
        mockFunctions.updateWish(wish, successHandler as (message: string) => void);
      }
    },
    isAdmin: () => {
      if (successHandler) {
        mockFunctions.isAdmin(successHandler as (isAdmin: boolean) => void);
      }
    },
  };

  return proxy as google.script.Runner;
};

/**
 * 初始化 Mock Google API（僅在本地開發時使用）
 */
export function initMockGoogleApi() {
  if (typeof google === 'undefined') {
    (window as unknown as { google: typeof google }).google = {
      script: {
        run: createProxy(),
      },
    };
    console.log('🔧 Mock Google API initialized');
  }
}
