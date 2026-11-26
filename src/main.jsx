import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WatchlistProvider } from './context/WatchlistContext';
import { WatchProgressProvider } from './context/WatchProgressContext';
import { WatchHistoryProvider } from './context/WatchHistoryContext';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <WatchlistProvider>
          <WatchProgressProvider>
            <WatchHistoryProvider>
              <App />
            </WatchHistoryProvider>
          </WatchProgressProvider>
        </WatchlistProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
