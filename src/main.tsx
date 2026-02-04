import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // 確保有引入 Tailwind

interface Wish {
  id: number;
  votes: number;
  title: string;
  desc: string;
  isOwner: boolean;
}

type MockFunctionMap = {
  getWishes: (success: (data: Wish[]) => void) => void;
  getUserVotedThemes: (success: (ids: number[]) => void) => void;
  addNewWish: (data: { title: string; desc: string }, success: (message: string) => void) => void;
  addVote: (id: number, success: (message: string) => void) => void;
  deleteWish: (success: (message: string) => void, id: number) => void;
  updateWish: (data: Wish, success: (message: string) => void) => void;
};

/** * Mock Google API for local development
 */
if (typeof google === 'undefined') {
  const mockFunctions: MockFunctionMap = {
    getWishes: (success: (data: Wish[]) => void) => {
      console.log('Mock: getWishes');
      success([
        {
          id: 2,
          votes: 10,
          title: 'React 19 樂觀更新',
          desc: '這就是你現在看到的',
          isOwner: true,
        },
        {
          id: 3,
          votes: 5,
          title: 'Tailwind v4 實戰',
          desc: '真的很簡潔',
          isOwner: false,
        },
      ]);
    },
    getUserVotedThemes: (success: (ids: number[]) => void) => {
      console.log('Mock: getUserVotedThemes');
      success([2]);
    },
    addNewWish: (data: { title: string; desc: string }, success: (message: string) => void) => {
      console.log('Mock: Add', data);
      success('許願成功');
    },
    addVote: (id: number, success: (message: string) => void) => {
      console.log('Mock: Vote', id);
      success('投票成功');
    },
    deleteWish: (success: (message: string) => void, id: number) => {
      console.log('Mock: Delete requested for ID', id);
      setTimeout(() => success('刪除成功'), 500); // 模擬一點點延遲更有感
    },
    updateWish: (data: Wish, success: (message: string) => void) => {
      console.log('Mock: Update', data);
      success('更新成功');
    },
  };

  const createProxy = (
    successHandler: ((result: any) => void) | null = null,
    failureHandler: ((error: Error) => void) | null = null
  ): google.script.Runner => {
    const proxy = {
      withSuccessHandler: (handler: (result: any) => void) => createProxy(handler, failureHandler),
      withFailureHandler: (handler: (error: Error) => void) => createProxy(successHandler, handler),
      getWishes: () => {
        if (successHandler) {
          mockFunctions.getWishes(successHandler);
        }
      },
      getUserVotedThemes: () => {
        if (successHandler) {
          mockFunctions.getUserVotedThemes(successHandler);
        }
      },
      addNewWish: (wish: { title: string; desc: string }) => {
        if (successHandler) {
          mockFunctions.addNewWish(wish, successHandler);
        }
      },
      addVote: (id: number) => {
        if (successHandler) {
          mockFunctions.addVote(id, successHandler);
        }
      },
      deleteWish: (id: number) => {
        if (successHandler) {
          mockFunctions.deleteWish(successHandler, id);
        }
      },
      updateWish: (wish: any) => {
        if (successHandler) {
          mockFunctions.updateWish(wish, successHandler);
        }
      },
    };

    return proxy as google.script.Runner;
  };

  (window as any).google = {
    script: {
      run: createProxy(),
    },
  };
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
