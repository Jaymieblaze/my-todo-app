import React, { useState, useEffect } from 'react';
import { Todo } from '../../utils/db';
import Dialog from '../Dialog';
import Button from '../Button';
import Input from '../Input';
import Checkbox from '../Checkbox';
import { EditIcon, LoaderSpin } from '../Icons';

// Interface for the component's props
interface EditTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
  onUpdateTodo: (id: number, updatedData: Partial<Todo>) => Promise<void>;
}

const EditTodoModal = ({ isOpen, onClose, todo, onUpdateTodo }: EditTodoModalProps) => {
  // Type the component's internal state
  const [title, setTitle] = useState<string>('');
  const [completed, setCompleted] = useState<boolean>(false);
  const [updating, setUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ## Using useEffect to populate state when the todo prop changes
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setCompleted(todo.completed);
      setError(null); // Clear previous errors when a new todo is loaded
    }
  }, [todo]);

  const handleSubmit = async () => {
    // Guard against submission if there's no todo
    if (!todo) return;

    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    setUpdating(true);
    setError(null);
    try {
      await onUpdateTodo(todo.id, { title, completed });
      onClose(); // Close modal on successful update
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(`Failed to update todo: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

  // If there is no todo, don't render the modal content
  if (!todo) {
    return null;
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit Todo" description={`Update the details for your todo item.`}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="edit-title" className="text-right text-sm font-medium">Title</label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setTitle(e.target.value);
              setError(null);
            }}
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
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompleted(e.target.checked)}
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

