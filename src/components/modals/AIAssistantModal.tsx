import React, { useState } from 'react';
import { Todo } from '../../utils/db';
import Dialog from '../Dialog';
import Button from '../Button';
import Input from '../Input';
import { LoaderSpin } from '../Icons';

// Placeholder for a real API call to an AI model.
const generateTasksFromAI = async (prompt: string): Promise<string[]> => {
  console.log("Sending prompt to AI:", prompt);
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Return a mock response
  if (prompt.toLowerCase().includes('vacation')) {
    return [
      "Book flights and accommodation",
      "Plan itinerary for each day",
      "Pack clothes and essentials",
      "Arrange for pet sitter",
      "Notify bank of travel dates"
    ];
  }
  return [
    `Break down '${prompt}' into smaller tasks`,
    "Research best practices for the main task",
    "Allocate time for each sub-task",
    "Review progress at the end of the day"
  ];
};


interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTasks: (tasks: Omit<Todo, 'id'>[]) => void;
}

const AIAssistantModal = ({ isOpen, onClose, onAddTasks }: AIAssistantModalProps) => {
  const [prompt, setPrompt] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt.');
      return;
    }
    setLoading(true);
    setError(null);
    setGeneratedTasks([]);
    try {
      const tasks = await generateTasksFromAI(prompt);
      setGeneratedTasks(tasks);
    } catch (e) {
      setError("Failed to connect to the AI assistant. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddSelectedTasks = () => {
    const newTodos: Omit<Todo, 'id'>[] = generatedTasks.map(title => ({
      title,
      completed: false,
      userId: 1, 
    }));
    onAddTasks(newTodos);
    handleClose();
  };
  
  const handleClose = () => {
    setPrompt('');
    setGeneratedTasks([]);
    setError(null);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} title="AI Assistant" description="Describe a goal, and the AI will generate a to-do list for you.">
      <div className="space-y-4">
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., Plan a team retreat"
          disabled={loading}
        />
        <Button onClick={handleGenerate} className="w-full" disabled={loading}>
          {loading && <LoaderSpin className="mr-2" />}
          Generate Tasks
        </Button>
        
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        {generatedTasks.length > 0 && (
          <div className="space-y-2 pt-4">
            <h3 className="font-semibold">Suggested Tasks:</h3>
            <ul className="list-disc list-inside bg-gray-50 p-4 rounded-md">
              {generatedTasks.map((task, index) => (
                <li key={index} className="text-gray-700">{task}</li>
              ))}
            </ul>
            <Button onClick={handleAddSelectedTasks} className="w-full !mt-4">Add to My List</Button>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default AIAssistantModal;
