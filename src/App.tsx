import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

// Components and pages
import TodosPage from './pages/TodosPage';
import TodoDetailPage from './pages/TodoDetailPage';
import AuthPage from './pages/AuthPage';
import ErrorBoundary from './components/ErrorBoundary';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';
import Button from './components/Button';

const AppContent = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth(); // Get user state from context

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const appStyle: React.CSSProperties = {
    fontFamily: '"Inter", sans-serif',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
  };

  return (
    <div className="antialiased" style={appStyle}>
      {/* Header*/}
      <header className="bg-indigo-600 text-white shadow-md">
        <nav className="container mx-auto px-4 py-4 flex justify-between items-center max-w-6xl">
          <h1 className="text-2xl font-bold">
            <Link to={user ? "/todos" : "/login"} className="text-white hover:text-indigo-100">
              My React Todo App
            </Link>
          </h1>
          {user && (
            <>
              <div className="sm:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2" aria-label="Toggle menu">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                  </svg>
                </button>
              </div>
              <ul className={`sm:flex items-center sm:space-x-4 ${isMenuOpen ? 'block' : 'hidden'} sm:block absolute sm:static top-16 left-0 right-0 bg-indigo-600 sm:bg-transparent p-4 sm:p-0`}>
                <li className="text-sm hidden sm:block">
                  {user.email}
                </li>
                <li>
                  <Button variant="secondary" size="sm" onClick={handleLogout}>Logout</Button>
                </li>
              </ul>
            </>
          )}
        </nav>
      </header>
      <main className="py-8">
        <ErrorBoundary showDetails={true}>
          {/* New routing logic with protected routes */}
          <Routes>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/todos" element={<ProtectedRoute><TodosPage /></ProtectedRoute>} />
            <Route path="/todos/:todoId" element={<ProtectedRoute><TodoDetailPage /></ProtectedRoute>} />
            <Route path="/" element={<Navigate to="/todos" replace />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </main>
    </div>
  );
};

// The main AppWrapper that includes the AuthProvider
const AppWrapper = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </BrowserRouter>
);

export default AppWrapper;

