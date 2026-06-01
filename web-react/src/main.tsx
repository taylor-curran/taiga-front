import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Generate a unique session identifier (mirrors taiga.generateUniqueSessionIdentifier)
if (!sessionStorage.getItem('taiga-session-id')) {
  const id = `${Date.now()}-${Math.floor(Math.random() * 0x9000000).toString(16)}`;
  sessionStorage.setItem('taiga-session-id', id);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
