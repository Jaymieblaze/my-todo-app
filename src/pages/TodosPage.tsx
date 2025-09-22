import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchData, performOperation, initializeNextTodoId, syncPendingOperations } from '../utils/api';
import { Todo } from '../utils/db';
import db from '../utils/db'; // Import the db instance
import AddTodoModal from '../components/modals/AddTodoModal';
import EditTodoModal from '../components/modals/EditTodoModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import TodoItem from '../components/TodoItem';
import Pagination from '../components/Pagination';
import SearchFilter from '../components/SearchFilter';
import Button from '../components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { PlusIcon, LoaderSpin } from '../components/Icons';

const TodosPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [connectionStatus, setConnectionStatus] = useState(navigator.onLine ? 'Online' : 'Offline');

  const ITEMS_PER_PAGE = 10;
  const API_URL = 'https://jsonplaceholder.typicode.com/todos';
  const CACHE_KEY = 'todos_data';

  // Fetch todos from the server and update the local database.
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Attempt to sync with the server. This function updates the local DB.
    const { error: fetchError } = await fetchData<Todo[]>(API_URL, { method: 'GET' }, CACHE_KEY);
    
    // Show an error if fetching fails while online, but proceed to load local data.
    if (fetchError && navigator.onLine) {
      console.error("Failed to fetch from server, showing local data.", fetchError);
      setError(fetchError);
    }
    
    // Read from the local database as the single source of truth for the UI.
    try {
      const allLocalTodos = await db.todos.where('isDeleted').equals(0).toArray();
      
      // Sort to show newest items first, which is a better UX.
      allLocalTodos.sort((a, b) => {
        const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        return dateB - dateA;
      });

      setTodos(allLocalTodos);
      await initializeNextTodoId();
    } catch (dbError) {
      setError(dbError instanceof Error ? dbError : new Error('Failed to read from local database'));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTodos();
    const handleOnline = () => {
      setConnectionStatus('Online');
      syncPendingOperations().then(() => fetchTodos());
    };
    const handleOffline = () => setConnectionStatus('Offline');
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchTodos]);

  const handleAddTodo = async (newTodoData: Omit<Todo, 'id'>) => {
    try {
      const { data, error: postError } = await performOperation(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodoData),
      }, 'add');
      if (postError) throw postError;
      if (data && data.id) {
        setTodos((prevTodos) => [data as Todo, ...prevTodos]);
      }
    } catch (e) {
      console.error('Error adding todo:', e);
      throw e;
    }
  };

  const handleUpdateTodo = async (todoToUpdate: Todo, updatedData: Partial<Todo>) => {
    try {
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo === todoToUpdate ? { ...todo, ...updatedData } : todo
        )
      );
      
      await performOperation(`${API_URL}/${todoToUpdate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      }, 'update');
      
    
    } catch (e) {
      console.error('Error updating todo:', e);
      // Revert UI on local failure
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo === todoToUpdate ? todoToUpdate : todo
        )
      );
    }
  };


  const handleDeleteTodo = async (todoToDelete: Todo) => {
    try {
      setTodos((prevTodos) => prevTodos.filter((todo) => todo !== todoToDelete));

      await performOperation(`${API_URL}/${todoToDelete.id}`, {
        method: 'DELETE',
      }, 'delete');

    } catch (e) {
      console.error('Error deleting todo:', e);
      // Revert UI on local failure
      setTodos((prevTodos) => [...prevTodos, todoToDelete]);
    }
  };
  
  const firstName = user?.displayName?.split(' ')[0] || 'User';

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

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleViewDetail = (id: number) => {
    navigate(`/todos/${id}`);
  };

  const handleOpenEditModal = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsDeleteModalOpen(true);
  };

  return (
    // <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
    //   <Card className="mb-6">
    //     <CardHeader>
    //       <CardTitle>Hi {firstName}!</CardTitle>
    //       <CardDescription>Manage your daily tasks efficiently</CardDescription>
    //       {/* Status indicator */}
    //       <div className="flex items-center text-sm pt-1">
    //         <span className={`h-2.5 w-2.5 rounded-full mr-2 ${connectionStatus === 'Online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
    //         <span className="text-gray-500">Status: {connectionStatus}</span>
    //       </div>
    //     </CardHeader>
    //     <CardContent className="flex justify-end pt-4 pb-0">
    //       <Button onClick={() => setIsAddModalOpen(true)} className="mb-4">
    //         <PlusIcon className="mr-2 h-4 w-4" /> Add New Todo
    //       </Button>
    //     </CardContent>
    //   </Card>
    //   <Card>
    //     <CardContent className="pt-6">
    //       <SearchFilter
    //         searchTerm={searchTerm}
    //         onSearchChange={setSearchTerm}
    //         filterStatus={filterStatus}
    //         onFilterChange={setFilterStatus}
    //       />
    //       {loading ? (
    //         <div className="flex justify-center items-center h-48">
    //           <LoaderSpin className="h-8 w-8 text-indigo-600" />
    //           <span className="ml-2 text-lg text-gray-700">Loading todos...</span>
    //         </div>
    //       ) : error ? (
    //         <div className="text-center text-red-600 p-6 rounded-md bg-red-50 border border-red-200">
    //           <p className="font-semibold mb-2">Error loading todos:</p>
    //           <p>{error.message}</p>
    //           <Button onClick={fetchTodos} className="mt-4">Try Again</Button>
    //         </div>
    //       ) : filteredTodos.length === 0 ? (
    //         <div className="text-center text-gray-600 p-6">
    //           <p className="text-lg font-semibold">No todos found.</p>
    //           <p className="text-sm">Try adjusting your search or filters.</p>
    //         </div>
    //       ) : (
    //         <div className="space-y-2">
    //           {currentTodos.map((todo, index) => (
    //             <TodoItem
    //               key={`${todo.id}-${todo.title}-${index}`}
    //               todo={todo}
    //               onViewDetail={handleViewDetail}
    //               onEdit={handleOpenEditModal}
    //               onDelete={() => handleOpenDeleteModal(todo)}
    //             />
    //           ))}
    //         </div>
    //       )}
    //       {filteredTodos.length > ITEMS_PER_PAGE && (
    //         <Pagination
    //           totalItems={filteredTodos.length}
    //           itemsPerPage={ITEMS_PER_PAGE}
    //           currentPage={currentPage}
    //           onPageChange={handlePageChange}
    //         />
    //       )}
    //     </CardContent>
    //   </Card>
    //   <AddTodoModal
    //     isOpen={isAddModalOpen}
    //     onClose={() => setIsAddModalOpen(false)}
    //     onAddTodo={handleAddTodo}
    //   />
    //   {selectedTodo && (
    //     <>
    //       <EditTodoModal
    //         isOpen={isEditModalOpen}
    //         onClose={() => setIsEditModalOpen(false)} 
    //         todo={selectedTodo}
    //         onUpdateTodo={(updatedData) => handleUpdateTodo(selectedTodo, updatedData)}
    //       />
    //       <ConfirmDeleteModal
    //         isOpen={isDeleteModalOpen}
    //         onClose={() => setIsDeleteModalOpen(false)} 
    //         todo={selectedTodo}
    //         onDeleteTodo={() => handleDeleteTodo(selectedTodo)}
    //       />
    //     </>
    //   )}
    // </div>

    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
      {/* Header Card */}
      <div className="flex justify-between items-center mb-8">
        <div className='space-y-1 ml-2'>
          <h1 className="text-3xl font-bold text-gray-800">Hi {firstName}!</h1>
          <CardDescription>Manage your daily tasks efficiently</CardDescription>
          <div className="flex items-center text-sm text-gray-500 mt-1">
            <span className={`h-2.5 w-2.5 rounded-full mr-2 ${connectionStatus === 'Online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
            Status: {connectionStatus}
          </div>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Todo
        </Button>
      </div>

      <Card className="shadow-lg border-gray-200/80">
        <CardContent className="p-4 sm:p-6">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterChange={setFilterStatus}
          />
          {loading ? (
            <div className="flex justify-center items-center h-48 text-gray-500">
              <LoaderSpin className="h-6 w-6" />
              <span className="ml-2">Loading your tasks...</span>
            </div>
          ) : error ? (
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <p className="font-semibold text-red-700">Error loading todos</p>
              <Button onClick={fetchTodos} className="mt-4">Try Again</Button>
            </div>
          ) : filteredTodos.length === 0 ? (
            <div className="text-center text-gray-500 p-10">
              <p className="font-semibold">No todos found.</p>
              <p className="text-sm">Looks like a great day to add a new task!</p>
            </div>
          ) : (
            // ## List container for modern TodoItems
            <div className="mt-4 border-t border-gray-200">
              {currentTodos.map((todo, index) => (
                <TodoItem
                  key={`${todo.id}-${todo.title}-${index}`}
                  todo={todo}
                  onViewDetail={() => navigate(`/todos/${todo.id}`)}
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
              onPageChange={(page) => setCurrentPage(page)}
            />
          )}
        </CardContent>
      </Card>

      <AddTodoModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddTodo={handleAddTodo} />
      {selectedTodo && (
        <>
          <EditTodoModal isOpen={isEditModalOpen} onClose={() => setSelectedTodo(null)} todo={selectedTodo} onUpdateTodo={(data) => handleUpdateTodo(selectedTodo, data)} />
          <ConfirmDeleteModal isOpen={isDeleteModalOpen} onClose={() => setSelectedTodo(null)} todo={selectedTodo} onDeleteTodo={() => handleDeleteTodo(selectedTodo)} />
        </>
      )}
    </div>
  );
};

export default TodosPage;

