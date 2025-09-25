import React, { useState } from 'react';
import { Todo } from '../../utils/db';
import Dialog from '../Dialog';
import Button from '../Button';
import Input from '../Input';
import Select from '../Select';
import { PlusIcon, LoaderSpin } from '../Icons';

interface AddTodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTodo: (newTodoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

const AddTodoModal = ({ isOpen, onClose, onAddTodo }: AddTodoModalProps) => {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('low');
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
      // Pass DueDate and priority fields
      await onAddTodo({ title, completed: false, userId: 1, dueDate, priority });
      // Reset the form after submission
      setTitle('');
      setDueDate('');
      setPriority('low');
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Add a New Task" description="What do you need to get done?">
      <div className="grid gap-4 py-4">
        <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">Title</label>
            <Input
            id="title"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(null); }}
            placeholder="e.g., Finalize the project report"
            aria-label="Todo title"
            />
        </div>

        {/* Due Date and Priority */}
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <label htmlFor="due-date" className="text-sm font-medium">Due Date</label>
                <Input id="due-date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">Priority</label>
                <Select id="priority" value={priority} onChange={e => setPriority(e.target.value as 'low' | 'medium' | 'high')}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </Select>
            </div>
        </div>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={adding}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={adding}>
          {adding ? <LoaderSpin className="mr-2" /> : <PlusIcon className="mr-2 h-4 w-4" />}
          {adding ? 'Adding...' : 'Add Task'}
        </Button>
      </div>
    </Dialog>
  );
};

export default AddTodoModal;

