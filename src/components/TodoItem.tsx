import { Todo } from '../utils/db'; 
import Button from './Button';
import { EditIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from './Icons';
import { Card } from './Card';

// Interface for the component's props
interface TodoItemProps {
  todo: Todo;
  onViewDetail: (id: number) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

// Apply the props interface to the component
const TodoItem = ({ todo, onViewDetail, onEdit, onDelete }: TodoItemProps) => (
  <Card className="shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between p-4">
      <div className="flex-1 flex items-center space-x-3 cursor-pointer" onClick={() => onViewDetail(todo.id)}>
        {todo.completed ? (
          <CheckCircleIcon className="text-green-500 h-5 w-5" aria-label="Completed" />
        ) : (
          <XCircleIcon className="text-red-500 h-5 w-5" aria-label="Incomplete" />
        )}
        <span className={`font-medium text-lg ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`} aria-label={`Todo title: ${todo.title}`}>
          {todo.title}
        </span>
      </div>
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(todo)} aria-label={`Edit todo: ${todo.title}`}>
          <EditIcon className="h-5 w-5 text-indigo-600" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(todo)} aria-label={`Delete todo: ${todo.title}`}>
          <TrashIcon className="h-5 w-5 text-red-600" />
        </Button>
      </div>
    </div>
  </Card>
);

export default TodoItem;
