import React, { useState } from 'react';
import { Todo } from '../../utils/db'; // Import the Todo type
import Dialog from '../Dialog';
import Button from '../Button';
import Input from '../Input';
import Checkbox from '../Checkbox';
import { PlusIcon, LoaderSpin } from '../Icons';

// ## 1. Define the props interface
interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ## 2. Correct the onAddTodo function signature to match TodosPage
  onAddTodo: (newTodoData: Omit<Todo, 'id'>) => Promise<void>;
}

const AddTodoModal = ({ isOpen, onClose, onAddTodo }: AddTodoModalProps) => {
  const [title, setTitle] = useState('');
  const [completed, setCompleted] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    setAdding(true);
    setError(null);
    try {
      // ## 3. The object passed here now correctly matches the Omit<Todo, 'id'> type
      await onAddTodo({ title, completed, userId: 1 });
      setTitle('');
      setCompleted(false);
      if (!navigator.onLine) {
        setError('Todo added locally, will sync when online.');
        setTimeout(onClose, 1500); // Close after showing message
      } else {
        onClose();
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(`Failed to add todo: ${errorMessage}`);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add New Todo" description="Enter the details for your new todo item.">
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="title" className="text-right text-sm font-medium">Title</label>
          <Input
            id="title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(null); }}
            className="col-span-3"
            placeholder="e.g., Buy groceries"
            aria-label="Todo title"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <div className="col-start-2 col-span-3">
            <Checkbox
              id="completed"
              label="Completed"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm text-center col-span-4">{error}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={adding}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={adding}>
          {adding ? <LoaderSpin className="mr-2" /> : <PlusIcon className="mr-2 h-4 w-4" />}
          {adding ? 'Adding...' : 'Add Todo'}
        </Button>
      </div>
    </Dialog>
  );
};

export default AddTodoModal;

