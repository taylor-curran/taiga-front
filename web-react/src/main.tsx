import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { useSessionStore } from './stores/sessionStore';
import './styles/taiga-listings.css';

useSessionStore.getState().hydrateFromStorage();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
