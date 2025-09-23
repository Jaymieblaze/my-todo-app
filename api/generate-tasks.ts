import { OpenAI } from 'openai';

// Initialize the OpenAI client with the API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// The main function that will be executed by Vercel
export default async function handler(req: any, res: any) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    // Call the OpenAI API to get a chat completion
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", 
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that generates simple, actionable to-do lists. Respond with only a JSON array of strings, like [\"Task 1\", \"Task 2\"]." 
        },
        { 
          role: "user", 
          content: prompt 
        }
      ],
      response_format: { type: "json_object" }, // Ensure the response is JSON
    });

    const result = completion.choices[0].message?.content;

    if (!result) {
        throw new Error("No content received from AI.");
    }
    
    // The model should return a JSON string like '{"tasks": ["Task 1", "Task 2"]}'
    const parsedResult = JSON.parse(result);

    // Send the array of tasks back to the frontend
    res.status(200).json(parsedResult);

  } catch (error) {
    console.error("Error calling OpenAI:", error);
    res.status(500).json({ error: 'Failed to generate tasks from AI.' });
  }
}
