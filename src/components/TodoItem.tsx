import { Todo } from '../utils/db'; 
import Button from './Button';
import { EditIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from './Icons';
import { Card } from './Card';

// Interface for the component's props
interface TodoItemProps {
  todo: Todo;
  onViewDetail: (id: string) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}

// Apply the props interface to the component
// const TodoItem = ({ todo, onViewDetail, onEdit, onDelete }: TodoItemProps) => (
//   <Card className="shadow-sm hover:shadow-md transition-shadow">
//     <div className="flex items-center justify-between p-4">
//       <div className="flex-1 flex items-center space-x-3 cursor-pointer" onClick={() => onViewDetail(todo.id)}>
//         {todo.completed ? (
//           <CheckCircleIcon className="text-green-500 h-5 w-5" aria-label="Completed" />
//         ) : (
//           <XCircleIcon className="text-red-500 h-5 w-5" aria-label="Incomplete" />
//         )}
//         <span className={`font-medium text-lg ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`} aria-label={`Todo title: ${todo.title}`}>
//           {todo.title}
//         </span>
//       </div>
//       <div className="flex space-x-2">
//         <Button variant="ghost" size="icon" onClick={() => onEdit(todo)} aria-label={`Edit todo: ${todo.title}`}>
//           <EditIcon className="h-5 w-5 text-indigo-600" />
//         </Button>
//         <Button variant="ghost" size="icon" onClick={() => onDelete(todo)} aria-label={`Delete todo: ${todo.title}`}>
//           <TrashIcon className="h-5 w-5 text-red-600" />
//         </Button>
//       </div>
//     </div>
//   </Card>
// );

const TodoItem = ({ todo, onViewDetail, onEdit, onDelete }: TodoItemProps) => (
  <div className="group flex items-center p-4 border-b border-gray-200/80 hover:bg-gray-50 transition-colors duration-200">
    <div className="flex-1 flex items-center space-x-4 cursor-pointer" onClick={() => onViewDetail(todo.id)}>
      {todo.completed ? (
        <CheckCircleIcon className="h-6 w-6 text-green-500" />
      ) : (
        <XCircleIcon className="h-6 w-6 text-gray-400 group-hover:text-gray-600" />
      )}
      <span className={`text-lg ${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
        {todo.title}
      </span>
    </div>
    
    {/* Action buttons now appear on hover for a cleaner look */}
    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button onClick={() => onEdit(todo)} className="p-2 rounded-full hover:bg-indigo-100" aria-label={`Edit todo: ${todo.title}`}>
        <EditIcon className="h-5 w-5 text-indigo-600" />
      </button>
      <button onClick={() => onDelete(todo)} className="p-2 rounded-full hover:bg-red-100" aria-label={`Delete todo: ${todo.title}`}>
        <TrashIcon className="h-5 w-5 text-red-600" />
      </button>
    </div>
  </div>
);

export default TodoItem;
