// src/pages/TodosPage.jsx
import React, { useState, useEffect, useCallback } from 'react'; // Removed useContext here as AppContext is no longer used for navigation
import { useNavigate } from 'react-router-dom';

// Import components and utilities
import { fetchData, getNextTodoId, initializeNextTodoId } from '../utils/api';
import AddTodoModal from '../components/modals/AddTodoModal';
import EditTodoModal from '../components/modals/EditTodoModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import TodoItem from '../components/TodoItem';
import Pagination from '../components/Pagination';
import SearchFilter from '../components/SearchFilter';
import Button from '../components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { PlusIcon, EditIcon, TrashIcon, CheckCircleIcon, XCircleIcon, LoaderSpin } from '../components/Icons'; // Import all specific icons and loader


const TodosPage = () => {
  const navigate = useNavigate(); 

  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'completed', 'incomplete'

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState(null);

  const ITEMS_PER_PAGE = 10;
  const API_URL = 'https://jsonplaceholder.typicode.com/todos';
  const CACHE_KEY = 'todos_data';

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await fetchData(API_URL, { method: 'GET' }, CACHE_KEY);
    if (data) {
      setTodos(data);
      // Ensure nextTodoId is higher than any existing ID using initializeNextTodoId
      const maxId = data.reduce((max, todo) => Math.max(max, todo.id), 0);
      initializeNextTodoId(maxId + 1); // Correctly call the utility to update the ID counter
    }
    if (fetchError) {
      setError(fetchError);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleAddTodo = async (newTodoData) => {
    try {
      // Simulate API POST request
      const { data, error: postError } = await fetchData(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newTodoData,
          id: getNextTodoId(), // Assign a unique ID using the util
        }),
      });

      if (postError) throw postError;

      // Optimistically update UI and local cache
      setTodos((prevTodos) => [data, ...prevTodos]);
      // Update the cache explicitly after modification
      localStorage.setItem(CACHE_KEY, JSON.stringify([data, ...todos]));
      fetchTodos(); 
    } catch (e) {
      console.error('Error adding todo:', e);
      throw e; 
    }
  };

  const handleUpdateTodo = async (id, updatedData) => {
    try {
      // Simulate API PUT request
      const { data, error: putError } = await fetchData(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (putError) throw putError;
      // Optimistically update UI and local cache
      setTodos((prevTodos) =>
        prevTodos.map((todo) => (todo.id === id ? { ...todo, ...updatedData } : todo))
      );
      // Update the cache explicitly after modification
      localStorage.setItem(CACHE_KEY, JSON.stringify(todos.map((todo) => (todo.id === id ? { ...todo, ...updatedData } : todo))));
      fetchTodos(); // Re-fetch to ensure full sync if needed
    } catch (e) {
      console.error('Error updating todo:', e);
      throw e;
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      // Simulate API DELETE request
      const { error: deleteError } = await fetchData(`${API_URL}/${id}`, {
        method: 'DELETE',
      });

      if (deleteError) throw deleteError;

      // Optimistically update UI and local cache
      setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
      // Update the cache explicitly after modification
      localStorage.setItem(CACHE_KEY, JSON.stringify(todos.filter((todo) => todo.id !== id)));
      fetchTodos(); // Re-fetch to ensure full sync if needed
    } catch (e) {
      console.error('Error deleting todo:', e);
      throw e;
    }
  };

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && todo.completed) ||
      (filterStatus === 'incomplete' && !todo.completed);
    return matchesSearch && matchesFilter;
  });

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentTodos = filteredTodos.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredTodos.length / ITEMS_PER_PAGE);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewDetail = (id) => {
    navigate(`/todos/${id}`);
  };

  const handleOpenEditModal = (todo) => {
    setSelectedTodo(todo);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (todo) => {
    setSelectedTodo(todo);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>My Todo List</CardTitle>
          <CardDescription>Manage your daily tasks efficiently.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-end pt-4 pb-0">
          <Button onClick={() => setIsAddModalOpen(true)} className="mb-4">
            <PlusIcon className="mr-2 h-4 w-4" /> Add New Todo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
          />

          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoaderSpin className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-lg text-gray-700">Loading todos...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 p-6 rounded-md bg-red-50 border border-red-200">
              <p className="font-semibold mb-2">Error loading todos:</p>
              <p>{error.message}</p>
              <Button onClick={fetchTodos} className="mt-4">Try Again</Button>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center text-gray-600 p-6">
              <p className="text-lg font-semibold">No todos found.</p>
              <p className="text-sm">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentTodos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onViewDetail={handleViewDetail}
                    onEdit={handleOpenEditModal}
                    onDelete={handleOpenDeleteModal}
                  />
              ))}
            </div>
          )}

          {filteredTodos.length > ITEMS_PER_PAGE && (
            <Pagination
              totalItems={filteredTodos.length}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </CardContent>
      </Card>

      <AddTodoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTodo={handleAddTodo}
      />
      {selectedTodo && (
        <>
          <EditTodoModal
            isOpen={isEditModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            todo={selectedTodo}
            onUpdateTodo={handleUpdateTodo}
          />
          <ConfirmDeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            todo={selectedTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        </>
      )}
    </div>
  );
};

export default TodosPage;