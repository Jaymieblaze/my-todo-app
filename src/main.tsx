import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './App.js';
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppWrapper />
    </React.StrictMode>
  );
}
