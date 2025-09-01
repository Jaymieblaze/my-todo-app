import db, { Todo, PendingOperation } from './db'; // Assuming types are exported from db.ts

let nextTodoId = 201;

// Define a generic response type for fetchData
interface FetchResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

// Define the shape of fetch options
interface FetchOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export const fetchData = async <T>(url: string, options: FetchOptions = { method: 'GET' }, cacheKey: string | null = null): Promise<FetchResponse<T>> => {
  let data: T | null = null;
  let error: Error | null = null;
  let loading = true;

  // Check if offline
  if (!navigator.onLine && options.method === 'GET') {
    try {
      // Load from IndexedDB
      if (url.includes('/todos/') && url.match(/\/todos\/\d+$/)) {
        // Fetch single todo
        const id = parseInt(url.split('/').pop() || '0');
        const todo = await db.todos.get(id);
        if (todo && !todo.isDeleted) {
          data = todo as T;
        } else {
          throw new Error('Todo not found');
        }
      } else {
        // Fetch all todos
        const todos = await db.todos.where('isDeleted').equals(0).toArray();
        data = todos as T;
      }
      loading = false;
    } catch (e) {
      error = e instanceof Error ? e : new Error('An unknown error occurred');
      loading = false;
    }
    return { data, error, loading };
  }

  // Online: Try cache first for GET requests
  if (navigator.onLine && cacheKey && options.method === 'GET') {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        data = JSON.parse(cachedData) as T;
        loading = false;
        // Sync IndexedDB with cache in background
        syncLocalStorageToIndexedDB(data, cacheKey);
        return { data, error, loading };
      } catch (e) {
        console.error('Failed to parse cached data:', e);
        localStorage.removeItem(cacheKey);
      }
    }
  }

  // Fetch from API if online
  if (navigator.onLine) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const responseData = await response.json();
      data = responseData as T;

      if (cacheKey && options.method === 'GET') {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        // Update IndexedDB
        if (Array.isArray(data)) {
          await db.todos.bulkPut(data.map((todo: Todo) => ({
            ...todo,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isSynced: 1,
            isDeleted: 0
          })));
        } else if (data && typeof data === 'object' && 'id' in data) {
          await db.todos.put({
            ...(data as Todo),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isSynced: 1,
            isDeleted: 0
          });
        }
      }
    } catch (e) {
      error = e instanceof Error ? e : new Error('An unknown error occurred');
    } finally {
      loading = false;
    }
  }

  return { data, error, loading };
};

// Sync localStorage cache to IndexedDB
const syncLocalStorageToIndexedDB = async (data: any, cacheKey: string): Promise<void> => {
  if (cacheKey === 'todos_data' && Array.isArray(data)) {
    await db.todos.bulkPut(data.map((todo: Todo) => ({
      ...todo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSynced: 1,
      isDeleted: 0
    })));
  }
};

type OperationType = 'add' | 'update' | 'delete';

export const performOperation = async (url: string, options: FetchOptions = {}, operationType: OperationType): Promise<{ data: Partial<Todo> | null, error: Error | null }> => {
  const todoIdMatch = url.match(/\/todos\/(\d+)$/);
  const todoId = todoIdMatch ? parseInt(todoIdMatch[1]) : getNextTodoId();
  let data: Partial<Todo> | null = null;
  let error: Error | null = null;

  // Offline: Queue operation
  if (!navigator.onLine) {
    try {
      let todoData: Partial<Todo> = options.body ? JSON.parse(options.body as string) : {};
      const timestamp = new Date().toISOString();
      const operation: Omit<PendingOperation, 'opId'> = { type: operationType, todoId, data: todoData, timestamp };
      
      if (operationType === 'add') {
        todoData = { ...todoData, id: todoId, createdAt: timestamp, updatedAt: timestamp, isSynced: 0, isDeleted: 0 };
        await db.todos.put(todoData as Todo);
        await db.pendingOperations.add(operation);
        data = todoData;
      } else if (operationType === 'update') {
        await db.todos.update(todoId, { ...todoData, updatedAt: timestamp, isSynced: 0 });
        await db.pendingOperations.add(operation);
        data = await db.todos.get(todoId) || null;
      } else if (operationType === 'delete') {
        await db.todos.update(todoId, { isDeleted: 1, updatedAt: timestamp, isSynced: 0 });
        await db.pendingOperations.add({ ...operation, data: {} });
        data = { id: todoId };
      }
    } catch (e) {
      error = e instanceof Error ? e : new Error('An unknown error occurred');
    }
    return { data, error };
  }

  // Online: Perform operation and sync
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const responseData = options.method !== 'DELETE' ? await response.json() : { id: todoId };
    data = responseData;
    const timestamp = new Date().toISOString();
    
    // Update IndexedDB
    if (operationType === 'add') {
      await db.todos.put({ ...(data as Todo), createdAt: timestamp, updatedAt: timestamp, isSynced: 1, isDeleted: 0 });
    } else if (operationType === 'update') {
      await db.todos.update(todoId, { ...(data as Todo), updatedAt: timestamp, isSynced: 1 });
    } else if (operationType === 'delete') {
      await db.todos.update(todoId, { isDeleted: 1, updatedAt: timestamp, isSynced: 1 });
    }
    
    // Update cache
    const cachedTodosStr = localStorage.getItem('todos_data') || '[]';
    let cachedTodos: Todo[] = JSON.parse(cachedTodosStr);
    
    if (operationType === 'add') {
      cachedTodos.unshift(data as Todo);
    } else if (operationType === 'update') {
      const index = cachedTodos.findIndex(t => t.id === todoId);
      if (index !== -1) cachedTodos[index] = data as Todo;
    } else if (operationType === 'delete') {
      cachedTodos = cachedTodos.filter(t => t.id !== todoId);
    }
    localStorage.setItem('todos_data', JSON.stringify(cachedTodos));
    
  } catch (e) {
    error = e instanceof Error ? e : new Error('An unknown error occurred');
  }
  return { data, error };
};

export const syncPendingOperations = async (): Promise<void> => {
  if (!navigator.onLine) return;
  
  const operations = await db.pendingOperations.toArray();
  const sortedOperations = operations.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  for (const op of sortedOperations) {
    if (!op.opId) continue;
    try {
      const url = op.type === 'add' ? 'https://jsonplaceholder.typicode.com/todos' : `https://jsonplaceholder.typicode.com/todos/${op.todoId}`;
      const options: FetchOptions = {
        method: op.type === 'add' ? 'POST' : op.type === 'update' ? 'PUT' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: op.type !== 'delete' ? JSON.stringify(op.data) : undefined
      };
      
      const { data, error } = await performOperation(url, options, op.type);
      
      if (!error && data) {
        const timestamp = new Date().toISOString();
        if (op.type === 'add' || op.type === 'update') {
          await db.todos.update(op.todoId, { ...(data as Todo), isSynced: 1, updatedAt: timestamp });
        } else if (op.type === 'delete') {
          await db.todos.update(op.todoId, { isDeleted: 1, isSynced: 1, updatedAt: timestamp });
        }
        await db.pendingOperations.delete(op.opId);
      }
    } catch (e) {
      console.error(`Failed to sync operation ${op.opId}:`, e);
    }
  }
};

export const getNextTodoId = (): number => nextTodoId++;

export const initializeNextTodoId = async (): Promise<void> => {
  const todos = await db.todos.toArray();
  if (todos.length > 0) {
    const maxId = todos.reduce((max, todo) => Math.max(max, todo.id || 0), 0);
    if (maxId >= nextTodoId) {
      nextTodoId = maxId + 1;
    }
  }
};
