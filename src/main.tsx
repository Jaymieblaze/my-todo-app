import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <AppWrapper />
        </AuthProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
