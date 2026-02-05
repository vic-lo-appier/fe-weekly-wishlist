import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initMockGoogleApi } from './mocks/googleApi';

// 初始化 Mock API（僅在本地開發時生效）
initMockGoogleApi();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
