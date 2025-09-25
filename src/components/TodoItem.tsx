import React from 'react';
import { Todo } from '../utils/db';
import { EditIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from './Icons';

interface TodoItemProps {
  todo: Todo;
  onViewDetail: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

// Helper to format dates
const formatDate = (dateString?: string) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  // Add a day to account for timezone issues with date inputs
  date.setDate(date.getDate() + 1);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
};

// Map priorities to colors
const priorityColors: Record<string, string> = {
  low: 'border-gray-400 text-gray-500',
  medium: 'border-blue-500 text-blue-600',
  high: 'border-red-500 text-red-600',
};


const TodoItem = ({ todo, onViewDetail, onEdit, onDelete }: TodoItemProps) => {
  const priorityStyle = priorityColors[todo.priority || 'low'];

  return (
    <div className="group flex items-center p-4 border-b border-gray-200/80 hover:bg-gray-50 transition-colors duration-200">
      <div className="flex-1 flex items-center space-x-4 cursor-pointer min-w-0" onClick={() => onViewDetail(todo.id)}>
        {todo.completed ? (
          <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
        ) : (
          <XCircleIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <span className={`text-lg truncate block ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {todo.title}
          </span>
          {/* Due date and priority */}
          <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
            {todo.dueDate && <span>Due: {formatDate(todo.dueDate)}</span>}
            {todo.dueDate && todo.priority && <span className="text-gray-300">|</span>}
            <span className={`capitalize border text-xs font-semibold px-2 py-0.5 rounded-full ${priorityStyle}`}>
              {todo.priority}
            </span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-4">
        <button onClick={() => onEdit(todo)} className="p-2 rounded-full hover:bg-indigo-100" aria-label={`Edit todo: ${todo.title}`}>
          <EditIcon className="h-5 w-5 text-indigo-600" />
        </button>
        <button onClick={() => onDelete(todo)} className="p-2 rounded-full hover:bg-red-100" aria-label={`Delete todo: ${todo.title}`}>
          <TrashIcon className="h-5 w-5 text-red-600" />
        </button>
      </div>
    </div>
  );
};

export default TodoItem;

