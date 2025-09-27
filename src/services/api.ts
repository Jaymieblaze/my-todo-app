// src/services/api.ts

/**
 * Calls the backend API to generate tasks from a prompt.
 * @param prompt - The user's input to generate tasks from.
 * @returns A promise that resolves to an array of task strings.
 */
export async function generateTasks(prompt: string): Promise<string[]> {
  try {
    const response = await fetch('/api/generate-tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      // If the server response is not OK, throw an error
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate tasks');
    }

    const data = await response.json();
    return data.tasks || []; // Ensure it always returns an array
  } catch (error) {
    console.error('Error calling generateTasks API:', error);
    // Re-throw the error so the component can handle it
    throw error;
  }
}