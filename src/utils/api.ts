import db, { Todo, PendingOperation } from './db';

let nextTodoId = 201;

// Helper to check if an object is a Todo
function isTodo(obj: any): obj is Todo {
  return obj && typeof obj === 'object' && 'id' in obj && 'title' in obj;
}

interface FetchResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

interface FetchOptions extends RequestInit {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
}

export const fetchData = async <T>(url: string, options: FetchOptions = { method: 'GET' }, cacheKey: string | null = null): Promise<FetchResponse<T>> => {
  let data: T | null = null;
  let error: Error | null = null;
  let loading = true;

  if (!navigator.onLine && options.method === 'GET') {
    try {
      if (url.includes('/todos/') && url.match(/\/todos\/\d+$/)) {
        const id = parseInt(url.split('/').pop() || '0');
        const todo = await db.todos.get(id);
        data = (todo && !todo.isDeleted) ? todo as T : null;
      } else {
        const todos = await db.todos.where('isDeleted').equals(0).toArray();
        data = todos as T;
      }
      if (!data) throw new Error('Data not found in local storage.');
    } catch (e) {
      error = e instanceof Error ? e : new Error('An unknown error occurred');
    }
    loading = false;
    return { data, error, loading };
  }
  
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const responseData = await response.json();
    data = responseData as T;

    if (cacheKey && options.method === 'GET') {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      if (Array.isArray(data)) {
        await db.todos.bulkPut(data.map((todo: Todo) => ({
          ...todo, isSynced: 1, isDeleted: 0
        })));
      } else if (isTodo(data)) {
        await db.todos.put({ ...data, isSynced: 1, isDeleted: 0 });
      }
    }
  } catch (e) {
    error = e instanceof Error ? e : new Error('An unknown error occurred');
  }
  loading = false;
  return { data, error, loading };
};

type OperationType = 'add' | 'update' | 'delete';

// ## Refactored function for a more robust offline-first strategy
export const performOperation = async (url: string, options: FetchOptions = {}, operationType: OperationType): Promise<{ data: Partial<Todo> | null, error: Error | null }> => {
  const todoIdMatch = url.match(/\/todos\/(\d+)$/);
  const todoId = todoIdMatch ? parseInt(todoIdMatch[1]) : getNextTodoId();
  let data: Partial<Todo> | null = null;
  const timestamp = new Date().toISOString();
  
  try {
    const todoData: Partial<Todo> = options.body ? JSON.parse(options.body as string) : {};
    
    // Step 1: Always perform the operation on the local DB first, marking it as unsynced.
    if (operationType === 'add') {
      data = { ...todoData, id: todoId, createdAt: timestamp, updatedAt: timestamp, isSynced: 0, isDeleted: 0 };
      await db.todos.put(data as Todo);
    } else if (operationType === 'update') {
      await db.todos.update(todoId, { ...todoData, updatedAt: timestamp, isSynced: 0 });
      data = await db.todos.get(todoId) || null;
    } else if (operationType === 'delete') {
      await db.todos.update(todoId, { isDeleted: 1, updatedAt: timestamp, isSynced: 0 });
      data = { id: todoId };
    }

    // Step 2: Always queue the operation for synchronization.
    const opData = (operationType === 'add' && data) ? data : todoData;
    await db.pendingOperations.add({ type: operationType, todoId, data: opData, timestamp });
    
    // Step 3: Attempt to sync immediately if the user is online.
    if (navigator.onLine) {
      // We don't need to wait for this, it can happen in the background.
      syncPendingOperations();
    }
    
    // Return the optimistically updated data to the UI immediately.
    return { data, error: null };

  } catch (e) {
    const error = e instanceof Error ? e : new Error('An unknown error occurred');
    console.error(`Failed to perform local operation: ${operationType}`, e);
    return { data: null, error };
  }
};


export const syncPendingOperations = async (): Promise<void> => {
  if (!navigator.onLine) return;

  const operations = await db.pendingOperations.toArray();
  if (operations.length === 0) return;

  console.log(`Syncing ${operations.length} pending operations...`);

  for (const op of operations) {
    if (!op.opId) continue;
    try {
      const url = op.type === 'add' ? 'https://jsonplaceholder.typicode.com/todos' : `https://jsonplaceholder.typicode.com/todos/${op.todoId}`;
      const options: FetchOptions = {
        method: op.type === 'add' ? 'POST' : op.type === 'update' ? 'PUT' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: op.type !== 'delete' ? JSON.stringify(op.data) : undefined,
      };
      
      const response = await fetch(url, options);
      if (response.ok) {
        // On successful sync, update the local item's sync status and remove the pending operation.
        const responseData = options.method !== 'DELETE' ? await response.json() : { id: op.todoId };
        if (op.type === 'delete') {
          await db.todos.update(op.todoId, { isDeleted: 1, isSynced: 1 });
        } else {
          // Important: Use the original todoId from the operation, not from the API response
          await db.todos.update(op.todoId, { ...responseData, id: op.todoId, isSynced: 1 });
        }
        await db.pendingOperations.delete(op.opId);
        console.log(`Successfully synced operation: ${op.type} for todo ${op.todoId}`);
      } else {
        // If the server rejects the request, log it but leave the item in the queue.
        console.error(`Server failed to sync operation ${op.opId}. Status: ${response.status}`);
      }
    } catch (e) {
      console.error(`Network error syncing operation ${op.opId}:`, e);
    }
  }
};


export const getNextTodoId = (): number => nextTodoId++;

export const initializeNextTodoId = async (): Promise<void> => {
  try {
    const todos = await db.todos.toArray();
    if (todos.length > 0) {
      const maxId = todos.reduce((max, todo) => Math.max(max, todo.id || 0), 0);
      nextTodoId = Math.max(201, maxId + 1);
    }
  } catch (e) {
    console.error("Failed to initialize next todo ID from DB:", e);
  }
};

