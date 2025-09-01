import React, { useState } from 'react';
import Dialog from '../Dialog';
import Button from '../Button';
import { TrashIcon, LoaderSpin } from '../Icons';

const ConfirmDeleteModal = ({ isOpen, onClose, todo, onDeleteTodo }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await onDeleteTodo(todo.id);
      onClose();
    } catch (e) {
      setError(`Failed to delete todo: ${e.message}`);
    } finally {
      setDeleting(false);
    }
  };

  if (!todo) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Confirm Deletion" description={`Are you sure you want to delete "${todo.title}"? This action cannot be reversed.`}>
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