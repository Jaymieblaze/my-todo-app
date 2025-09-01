import React, { useState } from 'react';
import { Todo } from '../../utils/db';
import Dialog from '../Dialog';
import Button from '../Button';
import { TrashIcon, LoaderSpin } from '../Icons';

// ## Interface for the component's props
interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  todo: Todo | null; 
  onDeleteTodo: (id: number) => Promise<void>;
}

const ConfirmDeleteModal = ({ isOpen, onClose, todo, onDeleteTodo }: ConfirmDeleteModalProps) => {
  const [deleting, setDeleting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    // Guard against action if there's no todo
    if (!todo) return;

    setDeleting(true);
    setError(null);
    try {
      await onDeleteTodo(todo.id);
      onClose(); // Close modal on successful deletion
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred';
      setError(`Failed to delete todo: ${errorMessage}`);
    } finally {
      setDeleting(false);
    }
  };

  // If there is no todo, don't render the modal
  if (!todo) {
    return null;
  }

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Confirm Deletion" 
      description={`Are you sure you want to delete "${todo.title}"? This action cannot be reversed.`}
    >
      {error && <p className="text-red-500 text-sm text-center py-2">{error}</p>}
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose} disabled={deleting}>Cancel</Button>
        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
          {deleting ? <LoaderSpin className="mr-2" /> : <TrashIcon className="mr-2 h-4 w-4" />}
          {deleting ? 'Deleting...' : 'Delete'}
        </Button>
      </div>
    </Dialog>
  );
};

export default ConfirmDeleteModal;
