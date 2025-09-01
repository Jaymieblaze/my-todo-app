import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchData } from '../utils/api';
import { Todo } from '../utils/db'; // Import the Todo type
import Button from '../components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { LoaderSpin } from '../components/Icons';

const TodoDetailPage = () => {
  const { todoId } = useParams<{ todoId: string }>(); // Explicitly type the route parameter
  const navigate = useNavigate();

  // ## 1. Type the component's state
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Constants for API and caching
  const API_URL = `https://jsonplaceholder.typicode.com/todos/${todoId}`;
  const CACHE_KEY = `todo_detail_${todoId}`;

  useEffect(() => {
    const fetchTodoDetails = async () => {
      // Ensure todoId is present before fetching
      if (!todoId) {
        setError(new Error("No Todo ID provided."));
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      // ## 2. Type the generic fetchData function call
      const { data, error: fetchError } = await fetchData<Todo>(API_URL, { method: 'GET' }, CACHE_KEY);
      
      if (data) {
        setTodo(data);
      }
      if (fetchError) {
        setError(fetchError);
      }
      setLoading(false);
    };
    fetchTodoDetails();
  }, [todoId, API_URL, CACHE_KEY]); // Add dependencies to useEffect array

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl min-h-[calc(100vh-4rem)]">
      <Card>
        <CardHeader>
          <CardTitle>Todo Details</CardTitle>
          <CardDescription>Detailed information about the selected todo item.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoaderSpin className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-lg text-gray-700">Loading todo details...</span>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 p-6 rounded-md bg-red-50 border border-red-200">
              <p className="font-semibold mb-2">Error loading todo details:</p>
              <p>{error.message}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">Refresh Page</Button>
            </div>
          ) : todo ? (
            <div className="grid gap-4 text-base">
              <p><strong className="font-semibold">ID:</strong> {todo.id}</p>
              <p><strong className="font-semibold">User ID:</strong> {todo.userId}</p>
              <p><strong className="font-semibold">Title:</strong> {todo.title}</p>
              <p>
                <strong className="font-semibold">Status:</strong>{' '}
                <span className={`font-semibold ${todo.completed ? 'text-green-600' : 'text-red-600'}`}>
                  {todo.completed ? 'Completed' : 'Incomplete'}
                </span>
              </p>
            </div>
          ) : (
            <div className="text-center text-gray-600 p-6">
              <p className="text-lg font-semibold">Todo not found.</p>
              <p className="text-sm">The requested todo item could not be loaded.</p>
            </div>
          )}
        </CardContent>
        <div className="p-6 pt-0 flex justify-start">
          <Button variant="outline" onClick={() => navigate('/todos')}>
            Back to List
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TodoDetailPage;
