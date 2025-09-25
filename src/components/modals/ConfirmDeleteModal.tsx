import React, { useState } from 'react';
import { Todo } from '../../utils/db';
import Dialog from '../Dialog';
import Button from '../Button';
import { TrashIcon, LoaderSpin } from '../Icons';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null;
  onDeleteTodo: () => void;
}

const ConfirmDeleteModal = ({ isOpen, onClose, todo, onDeleteTodo }: ConfirmDeleteModalProps) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onDeleteTodo();
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  if (!todo) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Are you absolutely sure?">
      <div className="py-4">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          This action cannot be undone. This will permanently delete the task:
          <strong className="block mt-1 text-gray-700 dark:text-slate-200">{todo.title}</strong>
        </p>
        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={deleting}>Cancel</Button>
        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
          {deleting ? <LoaderSpin className="mr-2" /> : <TrashIcon className="mr-2 h-4 w-4" />}
          {deleting ? 'Deleting...' : 'Yes, delete task'}
        </Button>
      </div>
    </Dialog>
  );
};

export default ConfirmDeleteModal;

