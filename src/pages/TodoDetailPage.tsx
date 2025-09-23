import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchTodoByIdFromFirestore } from '../utils/api';
import { Todo } from '../utils/db';
import Button from '../components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { LoaderSpin, CheckCircleIcon, XCircleIcon, CalendarIcon, FlagIcon } from '../components/Icons'; // Import new icons

const TodoDetailPage = () => {
  const { todoId } = useParams<{ todoId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTodoDetails = async () => {
      if (!user || !todoId) {
        setLoading(false);
        setError(new Error("User or Todo ID is missing."));
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchTodoByIdFromFirestore(user.uid, todoId);
        if (data) {
          setTodo(data);
        } else {
          setError(new Error("Todo not found."));
        }
      } catch (fetchError) {
        setError(fetchError as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchTodoDetails();
  }, [todoId, user]);
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const priorityStyles = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800',
  };


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
      <Card className="shadow-lg border-gray-200/80">
        <CardHeader>
          <CardTitle className="text-2xl">Task Details</CardTitle>
          <CardDescription>Detailed information about your selected task.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <LoaderSpin className="h-8 w-8 text-indigo-600" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 p-6">
              <p>{error.message}</p>
            </div>
          ) : todo ? (
            <div className="space-y-4 text-base">
              <div className="pb-4 border-b">
                <p className="text-sm text-gray-500 mb-1">Title</p>
                <p className="text-lg text-gray-900 font-semibold">{todo.title}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <p className="text-sm text-gray-500 flex items-center"><CalendarIcon className="h-4 w-4 mr-2"/> Due Date</p>
                    <p className="font-medium">{formatDate(todo.dueDate)}</p>
                </div>
                 <div className="space-y-1">
                    <p className="text-sm text-gray-500 flex items-center"><FlagIcon className="h-4 w-4 mr-2"/> Priority</p>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityStyles[todo.priority || 'low']}`}>
                        {todo.priority ? todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1) : 'Low'}
                    </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-gray-500 font-medium">Status</span>
                <div className={`flex items-center gap-2 font-semibold ${todo.completed ? 'text-green-600' : 'text-gray-500'}`}>
                  {todo.completed ? <CheckCircleIcon className="h-5 w-5" /> : <XCircleIcon className="h-5 w-5" />}
                  <span>{todo.completed ? 'Completed' : 'Incomplete'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-600 p-6">
              <p>No details to display.</p>
            </div>
          )}
        </CardContent>
        <div className="p-6 pt-4 flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate('/todos')}>
            Back to List
          </Button>
           {todo && <p className="text-xs text-gray-400">Task ID: {todo.id}</p>}
        </div>
      </Card>
    </div>
  );
};

export default TodoDetailPage;

