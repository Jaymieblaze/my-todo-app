import React, { useState, useEffect } from 'react';
import { Todo } from '../../utils/db';
import Dialog from '../Dialog';
import Button from '../Button';
import Input from '../Input';
import Checkbox from '../Checkbox';
import { EditIcon, LoaderSpin } from '../Icons';

// Define the props interface
interface EditTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
  onUpdateTodo: (updatedData: Partial<Todo>) => Promise<void>;
}

const EditTodoModal = ({ isOpen, onClose, todo, onUpdateTodo }: EditTodoModalProps) => {
  const [title, setTitle] = useState('');
  const [completed, setCompleted] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setCompleted(todo.completed);
    }
  }, [todo]);

  const handleSubmit = async () => {
    if (!todo) return;
    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    setUpdating(true);
    setError(null);
    try {
      // Pass only the new data back up.
      await onUpdateTodo({ title, completed });
      onClose();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(`Failed to update todo: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  if (!todo) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit Todo" description={`Update the details for your todo item.`}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="edit-title" className="text-right text-sm font-medium">Title</label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="col-span-3"
            placeholder="e.g., Buy groceries"
            aria-label="Todo title"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <div className="col-start-2 col-span-3">
            <Checkbox
              id="edit-completed"
              label="Completed"
              checked={completed}
              onChange={(e) => setCompleted(e.target.checked)}
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-sm text-center col-span-4">{error}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={updating}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={updating}>
          {updating ? <LoaderSpin className="mr-2" /> : <EditIcon className="mr-2 h-4 w-4" />}
          {updating ? 'Updating...' : 'Save Changes'}
        </Button>
      </div>
    </Dialog>
  );
};

export default EditTodoModal;

