import React, { useState, useEffect, createContext, useCallback, useContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate, Navigate } from 'react-router';

//Components and pages 
import TodosPage from './pages/TodosPage';
import TodoDetailPage from './pages/TodoDetailPage';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFoundPage';

export const AppContext = createContext(undefined);

const App = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <div className="sm:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </div>
            <ul className={`sm:flex sm:space-x-4 ${isMenuOpen ? 'block' : 'hidden'} sm:block absolute sm:static top-16 left-0 right-0 bg-indigo-600 sm:bg-transparent p-4 sm:p-0`}>
              <li>
                <Link
                  to="/todos"
                  className="block text-white hover:text-indigo-100 px-4 py-2 sm:px-3 sm:py-2 rounded-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Todos
                </Link>
              </li>
            </ul>
          </nav>
        </header>

        <main className="py-8">
          <ErrorBoundary showDetails={true}>
            <Routes>
              <Route path="/" element={<Navigate to="/todos" replace />} />
              <Route path="/todos" element={<TodosPage />} />
              <Route path="/todos/:todoId" element={<TodoDetailPage />} />
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
