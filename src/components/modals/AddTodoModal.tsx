import React, { useState } from 'react';
import Dialog from '../Dialog';
import Button from '../Button';
import Input from '../Input';
import { PlusIcon, LoaderSpin } from '../Icons';
import { Todo } from '../../utils/db';

// Shape of the data the parent component expects for a new todo
type NewTodo = Omit<Todo, 'id' | 'userId' | 'completed'>;

// Props for the modal component
interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTodo: (newTodo: NewTodo) => Promise<void>;
}

const AddTodoModal = ({ isOpen, onClose, onAddTodo }: AddTodoModalProps) => {
  // ## 1. Type the component's state
  const [title, setTitle] = useState<string>('');
  const [adding, setAdding] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ## 2. Reset state on close for a clean slate next time
  const handleClose = () => {
    setTitle('');
    setError(null);
    setAdding(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    setAdding(true);
    setError(null);
    try {
      // ## 3. Pass only the data required by the parent
      await onAddTodo({ title });
      
      if (!navigator.onLine) {
        setError('Todo added locally. It will sync when you are back online.');
        // Allow user to see the message before closing
        setTimeout(() => {
          handleClose();
        }, 2000);
      } else {
        handleClose();
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(`Failed to add todo: ${errorMessage}`);
      setAdding(false); // Re-enable button on error
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="Add New Todo" description="Enter the details for your new todo item.">
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="title" className="text-right text-sm font-medium">Title</label>
          <Input
            id="title"
            value={title}
            // ## 4. Type the event object for the onChange handler
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setTitle(e.target.value);
              setError(null); // Clear error on new input
            }}
            className="col-span-3"
            placeholder="e.g., Buy groceries"
            aria-label="Todo title"
          />
        </div>
        {error && <p className="text-red-500 text-sm text-center col-span-4">{error}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleClose} disabled={adding}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={adding || !title.trim()}>
          {adding ? <LoaderSpin className="mr-2" /> : <PlusIcon className="mr-2 h-4 w-4" />}
          {adding ? 'Adding...' : 'Add Todo'}
        </Button>
      </div>
    </Dialog>
  );
};

export default AddTodoModal;
