import * as functions from "firebase-functions/v1"; // This line has been corrected
import * as admin from "firebase-admin";
import { UserRecord } from "firebase-functions/v1/auth";

// Initialize the Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Define a clear type for the Todo data structure.
interface TodoData {
  title: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  userId: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
}

type DummyTodo = Omit<TodoData, "userId" | "createdAt" | "updatedAt" | "dueDate">;

// This is the Cloud Function that will trigger on new user creation.
export const createInitialTodos = functions.auth.user().onCreate(async (user: UserRecord) => {
  functions.logger.info(`New user signed up: ${user.uid}`, {structuredData: true});

  const dummyTodos: DummyTodo[] = [
    {
      title: "Welcome to your new to-do list!",
      completed: false,
      priority: "medium",
    },
    {
      title: "Click the pencil icon to edit this task",
      completed: false,
      priority: "low",
    },
    {
      title: "Click the checkbox to mark a task as complete",
      completed: true,
      priority: "low",
    },
    {
      title: "Use the 'AI Assistant' to generate new tasks",
      completed: false,
      priority: "high",
    },
  ];

  const todosCollectionRef = db.collection("users").doc(user.uid).collection("todos");

  const batch = db.batch();
  const timestamp = new Date().toISOString();

  dummyTodos.forEach((todo) => {
    const docRef = todosCollectionRef.doc();
    const newTodo: TodoData = {
      ...todo,
      userId: user.uid,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    batch.set(docRef, newTodo);
  });

  try {
    await batch.commit();
    functions.logger.info(`Successfully created initial todos for user ${user.uid}`);
  } catch (error) {
    functions.logger.error(`Failed to create initial todos for user ${user.uid}`, error);
  }
});

