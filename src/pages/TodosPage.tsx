import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { onSnapshot, collection } from 'firebase/firestore';
import { firestore } from '../firebase';
import { Todo } from '../utils/db';
import { addMultipleTodosToFirestore, performFirestoreOperation } from '../utils/api';
import Alert from '../components/Alert';
import AddTodoModal from '../components/modals/AddTodoModal';
import EditTodoModal from '../components/modals/EditTodoModal';
import ConfirmDeleteModal from '../components/modals/ConfirmDeleteModal';
import AIAssistantModal from '../components/modals/AIAssistantModal';
import TodoItem from '../components/TodoItem';
import Pagination from '../components/Pagination';
import SearchFilter from '../components/SearchFilter';
import Button from '../components/Button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../components/Dropdown';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { PlusIcon, LoaderSpin, SparklesIcon, ArrowUpDownIcon } from '../components/Icons';

const TodosPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [operationError, setOperationError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'incomplete'>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>('createdAt');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const todosCollectionRef = collection(firestore, `users/${user.uid}/todos`);

    const unsubscribe = onSnapshot(todosCollectionRef, (snapshot) => {
      const todosData: Todo[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          completed: data.completed || false,
          userId: data.userId || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          isSynced: data.isSynced ?? 1,
          isDeleted: data.isDeleted ?? 0,
          dueDate: data.dueDate,
          priority: data.priority || 'low',
        };
      });
      setTodos(todosData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching todos:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleOperation = async (action: () => Promise<any>, errorMessage: string) => {
    setOperationError(null);
    try {
      await action();
    } catch (e) {
      console.error(errorMessage, e);
      setOperationError((e as Error).message || 'An unexpected error occurred.');
    }
  };

  const handleAddTodo = (newTodoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    handleOperation(
      () => performFirestoreOperation(user.uid, 'add', newTodoData),
      'Error adding todo:'
    );
  };

  const handleAddMultipleTodos = (newTasks: Omit<Todo, 'id'>[]) => {
    if (!user) return;
    handleOperation(
      () => addMultipleTodosToFirestore(user.uid, newTasks),
      'Error adding multiple todos:'
    );
  };

  const handleUpdateTodo = (todoToUpdate: Todo, updatedData: Partial<Todo>) => {
    if (!user) return;
    const payload = { id: todoToUpdate.id, ...updatedData };
    handleOperation(
      () => performFirestoreOperation(user.uid, 'update', payload),
      'Error updating todo:'
    );
  };

  const handleDeleteTodo = (todoToDelete: Todo) => {
    if (!user) return;
    handleOperation(
      () => performFirestoreOperation(user.uid, 'delete', todoToDelete),
      'Error deleting todo:'
    );
  };
  
  const firstName = user?.displayName?.split(' ')[0] || 'User';
  
  const handleOpenEditModal = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsDeleteModalOpen(true);
  };
  
  const sortOptions = {
      createdAt: 'Date Created',
      dueDate: 'Due Date',
      priority: 'Priority'
  };

  const sortedAndFilteredTodos = React.useMemo(() => {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      
      return todos
        .filter(todo =>
          todo.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (filterStatus === 'all' || (filterStatus === 'completed' && todo.completed) || (filterStatus === 'incomplete' && !todo.completed))
        )
        .sort((a, b) => {
            switch (sortBy) {
                case 'dueDate':
                    return (a.dueDate || 'z') > (b.dueDate || 'z') ? 1 : -1;
                case 'priority':
                    return (priorityOrder[a.priority || 'low']) - (priorityOrder[b.priority || 'low']);
                case 'createdAt':
                default:
                    return (new Date(b.createdAt || 0).getTime()) - (new Date(a.createdAt || 0).getTime());
            }
        });
  }, [todos, searchTerm, filterStatus, sortBy]);


  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentTodos = sortedAndFilteredTodos.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(sortedAndFilteredTodos.length / ITEMS_PER_PAGE);

  const handleViewDetail = (id: string | undefined) => {
    if (id) navigate(`/todos/${id}`);
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-4xl">
       {operationError && (
        <Alert variant="destructive" className="mb-4">
          <p>{operationError}</p>
        </Alert>
      )}

      <Card className="mb-6 bg-white/50 backdrop-blur-sm border-gray-200/80 shadow-sm dark:bg-slate-900/50 dark:border-slate-800">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl text-gray-800 dark:text-slate-100">Hi {firstName},</CardTitle>
              <CardDescription className="mt-1 dark:text-slate-400">Here are your real-time tasks.</CardDescription>
            </div>
             <div className="flex items-center text-xs pt-1">
              <span className="h-2 w-2 rounded-full mr-2 bg-green-500"></span>
              <span className="text-gray-500 dark:text-slate-400">Live Sync</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex justify-end gap-2 pt-4 pb-4">
          <Button onClick={() => setIsAIAssistantOpen(true)} variant="outline">
             <SparklesIcon className="mr-2 h-4 w-4 text-indigo-500" /> AI Assistant
          </Button>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" /> Add New Todo
          </Button>
        </CardContent>
      </Card>
      <Card className="bg-white/50 backdrop-blur-sm border-gray-200/80 shadow-sm dark:bg-slate-900/50 dark:border-slate-800">
        <CardContent className="mt-2 pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 md:gap-4 lg:gap-4 mb-6">
            <div className="w-full flex-grow mb-0">
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
              />
            </div>
            <div className="w-full sm:w-auto flex-shrink-0">
                <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 h-10 px-4 py-2 w-full sm:w-auto dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                       Sort by: {sortOptions[sortBy]}
                       <ArrowUpDownIcon className="ml-2 h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => setSortBy('createdAt')}>Date Created</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setSortBy('dueDate')}>Due Date</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setSortBy('priority')}>Priority</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoaderSpin className="h-8 w-8 text-indigo-600" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 p-6">
              <p>{error.message}</p>
            </div>
          ) : sortedAndFilteredTodos.length === 0 ? (
            <div className="text-center text-gray-600 dark:text-gray-400 p-6">
              <p className="text-lg font-semibold">No tasks found. Create a New Task</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200/80 dark:divide-slate-800">
              {currentTodos.map((todo) => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  onViewDetail={() => handleViewDetail(todo.id)}
                  onEdit={() => handleOpenEditModal(todo)}
                  onDelete={() => handleOpenDeleteModal(todo)}
                />
              ))}
            </div>
          )}
          {sortedAndFilteredTodos.length > ITEMS_PER_PAGE && (
            <Pagination
              totalItems={sortedAndFilteredTodos.length}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </CardContent>
      </Card>
      <AddTodoModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAddTodo={handleAddTodo} />
      <AIAssistantModal isOpen={isAIAssistantOpen} onClose={() => setIsAIAssistantOpen(false)} onAddTasks={handleAddMultipleTodos} />
      {selectedTodo && (
        <>
          <EditTodoModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} todo={selectedTodo} onUpdateTodo={(data) => handleUpdateTodo(selectedTodo, data)} />
          <ConfirmDeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} todo={selectedTodo} onDeleteTodo={() => handleDeleteTodo(selectedTodo)} />
        </>
      )}
    </div>
  );
};

export default TodosPage;

