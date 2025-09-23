import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchTodoByIdFromFirestore } from '../utils/api';
import { Todo } from '../utils/db';
import Button from '../components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/Card';
import { LoaderSpin, CheckCircleIcon, XCircleIcon } from '../components/Icons';

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
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-500 font-medium">Task ID</span>
                <span className="text-gray-700 font-mono text-sm">{todo.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-gray-500 font-medium">Title</span>
                <span className="text-gray-900 font-semibold text-right">{todo.title}</span>
              </div>
              <div className="flex justify-between items-center pb-2">
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
        <div className="p-6 pt-0">
          <Button variant="outline" onClick={() => navigate('/todos')}>
            Back to List
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TodoDetailPage;

