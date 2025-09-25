import Dexie, { Table } from 'dexie';

export interface Todo {
  id: string;
  userId: number;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
  isSynced?: 0 | 1;
  isDeleted?: 0 | 1;
  dueDate?: string; // e.g., "2025-12-31"
  priority?: 'low' | 'medium' | 'high';
}

export interface PendingOperation {
  opId?: number;
  type: 'add' | 'update' | 'delete';
  todoId: number;
  data: Partial<Todo>;
  timestamp: string;
}

// Dexie offline DB setup
class MyTodoAppDB extends Dexie {
  todos!: Table<Todo>;
  pendingOperations!: Table<PendingOperation>;

  constructor() {
    super('TodoAppDB');
    this.version(1).stores({
      todos: 'id, userId, title, completed, createdAt, updatedAt, isSynced, isDeleted, dueDate, priority',
      pendingOperations: '++opId, type, todoId, timestamp'
    });
  }
}

const db = new MyTodoAppDB();

export default db;
