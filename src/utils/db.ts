import Dexie, { Table } from 'dexie';

// ## 1. Define the types for your data
export interface Todo {
  id: string;
  userId: number;
  title: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
  isSynced?: 0 | 1;
  isDeleted?: 0 | 1;
}

export interface PendingOperation {
  opId?: number;
  type: 'add' | 'update' | 'delete';
  todoId: number;
  data: Partial<Todo>;
  timestamp: string;
}

// ## 2. Create a class that extends Dexie
class MyTodoAppDB extends Dexie {
  // ## 3. Declare your tables as properties
  // The '!' is a non-null assertion, telling TypeScript that these will be initialized by Dexie
  todos!: Table<Todo>;
  pendingOperations!: Table<PendingOperation>;

  constructor() {
    super('TodoAppDB');
    this.version(1).stores({
      // Define schema with indexes
      todos: 'id, userId, title, completed, createdAt, updatedAt, isSynced, isDeleted',
      pendingOperations: '++opId, type, todoId, timestamp'
    });
  }
}

// ## 4. Export a single instance of your typed database
const db = new MyTodoAppDB();

export default db;
