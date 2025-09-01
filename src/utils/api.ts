import db from './db';

let nextTodoId = 201;

export const fetchData = async (url, options = {}, cacheKey = null) => {
  let data = null;
  let error = null;
  let loading = true;

  // Check if offline
  if (!navigator.onLine && options.method === 'GET') {
    try {
      // Load from IndexedDB
      if (url.includes('/todos/') && url.match(/\/todos\/\d+$/)) {
        // Fetch single todo
        const id = parseInt(url.split('/').pop());
        const todo = await db.todos.get(id);
        if (todo && !todo.isDeleted) {
          data = todo;
        } else {
          throw new Error('Todo not found');
        }
      } else {
        // Fetch all todos
        data = await db.todos.where('isDeleted').equals(0).toArray();
      }
      loading = false;
    } catch (e) {
      error = e;
      loading = false;
    }
    return { data, error, loading };
  }

  // Online: Try cache first for GET requests
  if (navigator.onLine && cacheKey && options.method === 'GET') {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        data = JSON.parse(cachedData);
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
      data = await response.json();
      if (cacheKey && options.method === 'GET') {
        localStorage.setItem(cacheKey, JSON.stringify(data));
        // Update IndexedDB
        if (Array.isArray(data)) {
          await db.todos.bulkPut(data.map(todo => ({
            ...todo,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isSynced: 1,
            isDeleted: 0
          })));
        } else if (data.id) {
          await db.todos.put({
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isSynced: 1,
            isDeleted: 0
          });
        }
      }
    } catch (e) {
      error = e;
    } finally {
      loading = false;
    }
  }

  return { data, error, loading };
};

// Sync localStorage cache to IndexedDB
const syncLocalStorageToIndexedDB = async (data, cacheKey) => {
  if (cacheKey === 'todos_data' && Array.isArray(data)) {
    await db.todos.bulkPut(data.map(todo => ({
      ...todo,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isSynced: 1,
      isDeleted: 0
    })));
  }
};

export const performOperation = async (url, options = {}, operationType) => {
  const todoId = url.match(/\/todos\/(\d+)$/) ? parseInt(url.split('/').pop()) : getNextTodoId();
  let data = null;
  let error = null;

  // Offline: Queue operation
  if (!navigator.onLine) {
    try {
      let todoData = options.body ? JSON.parse(options.body) : {};
      if (operationType === 'add') {
        todoData = { ...todoData, id: todoId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isSynced: 0, isDeleted: 0 };
        await db.todos.put(todoData);
        await db.pendingOperations.add({ type: 'add', todoId, data: todoData, timestamp: new Date().toISOString() });
        data = todoData;
      } else if (operationType === 'update') {
        await db.todos.update(todoId, { ...todoData, updatedAt: new Date().toISOString(), isSynced: 0 });
        await db.pendingOperations.add({ type: 'update', todoId, data: todoData, timestamp: new Date().toISOString() });
        data = await db.todos.get(todoId);
      } else if (operationType === 'delete') {
        await db.todos.update(todoId, { isDeleted: 1, updatedAt: new Date().toISOString(), isSynced: 0 });
        await db.pendingOperations.add({ type: 'delete', todoId, data: {}, timestamp: new Date().toISOString() });
        data = { id: todoId };
      }
    } catch (e) {
      error = e;
    }
    return { data, error };
  }

  // Online: Perform operation and sync
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    data = options.method !== 'DELETE' ? await response.json() : { id: todoId };
    // Update IndexedDB
    if (operationType === 'add') {
      await db.todos.put({ ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), isSynced: 1, isDeleted: 0 });
    } else if (operationType === 'update') {
      await db.todos.update(todoId, { ...data, updatedAt: new Date().toISOString(), isSynced: 1 });
    } else if (operationType === 'delete') {
      await db.todos.update(todoId, { isDeleted: 1, updatedAt: new Date().toISOString(), isSynced: 1 });
    }
    // Update cache
    if (operationType !== 'delete') {
      const cachedTodos = JSON.parse(localStorage.getItem('todos_data') || '[]');
      if (operationType === 'add') {
        cachedTodos.unshift(data);
      } else if (operationType === 'update') {
        const index = cachedTodos.findIndex(t => t.id === todoId);
        if (index !== -1) cachedTodos[index] = data;
      }
      localStorage.setItem('todos_data', JSON.stringify(cachedTodos));
    } else {
      const cachedTodos = JSON.parse(localStorage.getItem('todos_data') || '[]').filter(t => t.id !== todoId);
      localStorage.setItem('todos_data', JSON.stringify(cachedTodos));
    }
  } catch (e) {
    error = e;
  }
  return { data, error };
};

export const syncPendingOperations = async () => {
  if (!navigator.onLine) return;
  const operations = await db.pendingOperations.toArray();
  for (const op of operations.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))) {
    try {
      const url = op.type === 'add' ? 'https://jsonplaceholder.typicode.com/todos' : `https://jsonplaceholder.typicode.com/todos/${op.todoId}`;
      const options = {
        method: op.type === 'add' ? 'POST' : op.type === 'update' ? 'PUT' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: op.type !== 'delete' ? JSON.stringify(op.data) : undefined
      };
      const { data, error } = await performOperation(url, options, op.type);
      if (!error) {
        if (op.type === 'add' || op.type === 'update') {
          await db.todos.update(op.todoId, { ...data, isSynced: 1, updatedAt: new Date().toISOString() });
        } else if (op.type === 'delete') {
          await db.todos.update(op.todoId, { isDeleted: 1, isSynced: 1, updatedAt: new Date().toISOString() });
        }
        await db.pendingOperations.delete(op.opId);
      }
    } catch (e) {
      console.error(`Failed to sync operation ${op.opId}:`, e);
    }
  }
};

export const getNextTodoId = () => nextTodoId++;

export const initializeNextTodoId = async () => {
  const todos = await db.todos.toArray();
  const maxId = todos.reduce((max, todo) => Math.max(max, todo.id || 0), 0);
  if (maxId >= nextTodoId) nextTodoId = maxId + 1;
};