import React, { useState, useEffect, createContext, useCallback, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, Navigate } from 'react-router-dom';

//Components and pages 
import TodosPage from './pages/TodosPage';
import TodoDetailPage from './pages/TodoDetailPage';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFoundPage';
// import Button from './components/Button'; 

export const AppContext = createContext(undefined);

const App = () => {
  const navigate = useNavigate(); 

  const appProvidedContext = {
    navigateTo: useCallback((path) => navigate(path), [navigate]),
  };

  // Basic styling
  const appStyle = {
    fontFamily: '"Inter", sans-serif',
    minHeight: '100vh',
    backgroundColor: '#f8fafc', // gray-50
  };

  return (
    <div className="antialiased" style={appStyle}>
      {/* AppContext Provider */}
      <AppContext.Provider value={appProvidedContext}>
        <header className="bg-indigo-600 text-white shadow-md">
          <nav className="container mx-auto px-4 py-4 flex justify-between items-center max-w-6xl">
            <h1 className="text-2xl font-bold">
              {/* React Router's Link component for navigation */}
              <Link to="/todos" className="text-white hover:text-indigo-100 p-0 h-auto inline-flex items-center">
                My React Todo App
              </Link>
            </h1>
            <ul className="flex space-x-4">
              <li>
                {/* React Router's Link component for navigation */}
                <Link to="/todos" className="text-white hover:text-indigo-100 px-4 py-2 rounded-md">
                  Todos
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        <main className="py-8">
          <ErrorBoundary showDetails={true}>
            {/* Routes component from react-router-dom */}
            <Routes>
              {/* Redirect from the root path to /todos */}
              <Route path="/" element={<Navigate to="/todos" replace />} />
              {/* Define routes for the application */}
              <Route path="/todos" element={<TodosPage />} />
              <Route path="/todos/:todoId" element={<TodoDetailPage />} />
              {/* Catch-all route for any undefined paths (404 page) */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </AppContext.Provider>
    </div>
  );
};

const AppWrapper = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default AppWrapper;
