import Dexie from 'dexie';

const db = new Dexie('TodoAppDB');
db.version(1).stores({
  todos: 'id, userId, title, completed, createdAt, updatedAt, isSynced, isDeleted',
  pendingOperations: '++opId, type, todoId, data, timestamp' // Store pending operations for sync
});

export default db;