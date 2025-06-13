import React, { useState, useEffect } from 'react';
import Dialog from '../Dialog'; 
import Button from '../Button'; 
import Input from '../Input'; 
import Checkbox from '../Checkbox'; 
import { EditIcon, LoaderSpin } from '../Icons'; 

const EditTodoModal = ({ isOpen, onClose, todo, onUpdateTodo }) => {
  const [title, setTitle] = useState(todo ? todo.title : '');
  const [completed, setCompleted] = useState(todo ? todo.completed : false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

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
      await onUpdateTodo(todo.id, { title, completed });
      onClose();
    } catch (e) {
      setError(`Failed to update todo: ${e.message}`);
    } finally {
      setUpdating(false);
    }
  };

  if (!todo) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Edit Todo" description={`Editing todo ID: ${todo.id}`}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label htmlFor="edit-title" className="text-right text-sm font-medium">Title</label>
          <Input
            id="edit-title"
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