import { firestore } from '../firebase';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, writeBatch, FirestoreDataConverter, DocumentData, QueryDocumentSnapshot, SnapshotOptions, SetOptions } from 'firebase/firestore';
import { Todo } from './db';

const todoConverter: FirestoreDataConverter<Todo> = {
  fromFirestore: (snapshot: QueryDocumentSnapshot, options: SnapshotOptions): Todo => {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      title: data.title || '',
      completed: data.completed || false,
      userId: data.userId || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      isSynced: data.isSynced ?? 1,
      isDeleted: data.isDeleted ?? 0,
    };
  },
  
  toFirestore: (todo: Partial<Todo>, options?: SetOptions): DocumentData => {
    const { id, ...data } = todo;
    return data;
  }
};

const getTodosCollectionRef = (userId: string) => {
  return collection(firestore, `users/${userId}/todos`).withConverter(todoConverter);
};

const getTodoDocRef = (userId: string, todoId: string) => {
    return doc(firestore, `users/${userId}/todos`, todoId).withConverter(todoConverter);
}

export const fetchTodoByIdFromFirestore = async (userId: string, todoId: string): Promise<Todo | null> => {
  const todoDocRef = getTodoDocRef(userId, todoId);
  const docSnap = await getDoc(todoDocRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const fetchTodosFromFirestore = async (userId: string): Promise<Todo[]> => {
  const todosCollectionRef = getTodosCollectionRef(userId);
  const snapshot = await getDocs(todosCollectionRef);
  return snapshot.docs.map(doc => doc.data());
};

export const performFirestoreOperation = async (
  userId: string, 
  operationType: 'add' | 'update' | 'delete', 
  todo: Partial<Todo>
): Promise<Todo> => {
  const todosCollectionRef = getTodosCollectionRef(userId);

  switch (operationType) {
    case 'add':
      const newDocRef = doc(todosCollectionRef); 
      const newTodo: Todo = {
        userId: todo.userId || 1,
        title: todo.title || 'New Todo',
        completed: todo.completed || false,
        id: newDocRef.id, 
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(newDocRef, newTodo);
      return newTodo;
    
    case 'update':
      if (!todo.id) throw new Error("Todo ID is required for updates.");
      const todoDocRef = getTodoDocRef(userId, todo.id);
      const updatePayload = { ...todo, updatedAt: new Date().toISOString() };
      await updateDoc(todoDocRef, updatePayload);
      return { ...todo, id: todo.id } as Todo;

    case 'delete':
      if (!todo.id) throw new Error("Todo ID is required for deletion.");
      const docToDeleteRef = getTodoDocRef(userId, todo.id);
      await deleteDoc(docToDeleteRef);
      return todo as Todo;
      
    default:
      throw new Error("Invalid operation type");
  }
};

export const addMultipleTodosToFirestore = async (userId: string, tasks: Omit<Todo, 'id'>[]): Promise<Todo[]> => {
    const todosCollectionRef = getTodosCollectionRef(userId);
    const batch = writeBatch(firestore);
    const newTodos: Todo[] = [];

    tasks.forEach(task => {
        const newDocRef = doc(todosCollectionRef);
        const newTodo: Todo = {
            ...task,
            id: newDocRef.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        batch.set(newDocRef, newTodo);
        newTodos.push(newTodo);
    });

    await batch.commit();
    return newTodos;
};

