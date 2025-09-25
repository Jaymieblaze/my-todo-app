import React, { useState, useEffect } from 'react';
import { Todo } from '../../utils/db';
import Dialog from '../Dialog';
import Button from '../Button';
import Input from '../Input';
import Select from '../Select';
import Checkbox from '../Checkbox';
import { EditIcon, LoaderSpin } from '../Icons';

interface EditTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
  onUpdateTodo: (updatedData: Partial<Todo>) => void;
}

const EditTodoModal = ({ isOpen, onClose, todo, onUpdateTodo }: EditTodoModalProps) => {
  const [title, setTitle] = useState('');
  const [completed, setCompleted] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // This effect populates the form when a todo is selected
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setCompleted(todo.completed);
      setDueDate(todo.dueDate || ''); // Handle cases where dueDate might be undefined
      setPriority(todo.priority || 'low'); // Handle cases where priority might be undefined
    }
  }, [todo]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    setUpdating(true);
    setError(null);
    try {
      // Pass all updated fields to the handler function
      await onUpdateTodo({ title, completed, dueDate, priority });
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUpdating(false);
    }
  };
  
  if (!todo) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit Task" description="Make changes to your task below.">
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
          <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-label="Todo title"
          />
        </div>
        
        {/* Due Date and Priority */}
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label htmlFor="edit-due-date" className="text-sm font-medium">Due Date</label>
                <Input id="edit-due-date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
                <label htmlFor="edit-priority" className="text-sm font-medium">Priority</label>
                <Select id="edit-priority" value={priority} onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </Select>
            </div>
        </div>

        <Checkbox
          id="edit-completed"
          label="Mark as completed"
          checked={completed}
          onChange={(e) => setCompleted(e.target.checked)}
        />
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={updating}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={updating}>
          {updating ? <LoaderSpin className="mr-2" /> : <EditIcon className="mr-2 h-4 w-4" />}
          {updating ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </Dialog>
  );
};

export default EditTodoModal;

