import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import all the necessary pages and components for routing
import TodosPage from './pages/TodosPage';
import TodoDetailPage from './pages/TodoDetailPage';
import AuthPage from './pages/AuthPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />
      
      {/* Protected Routes */}
      <Route 
        path="/todos" 
        element={
          <ProtectedRoute>
            <TodosPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/todos/:todoId" 
        element={
          <ProtectedRoute>
            <TodoDetailPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Default and Wildcard Routes */}
      <Route path="/" element={<Navigate to="/todos" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;
