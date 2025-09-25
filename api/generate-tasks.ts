import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Access your API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export default async function handler(
  req: VercelRequest, 
  res: VercelResponse
) {
  // Ensure this is a POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    // Use the latest Gemini Flash model for speed and efficiency
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest"});

    // Instruct the model to return a response in a specific JSON format
    const fullPrompt = `Based on the following goal: "${prompt}", generate a short, actionable to-do list. Provide the response as a JSON array of strings in this format: {"tasks": ["task 1", "task 2"]}.`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean the response to ensure it's valid JSON before parsing
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResponse = JSON.parse(text);

    if (!parsedResponse.tasks || !Array.isArray(parsedResponse.tasks)) {
         throw new Error("Invalid format received from the Gemini API");
    }

    // Send the final array of tasks back to the frontend
    res.status(200).json({ tasks: parsedResponse.tasks });

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to generate tasks from the AI." });
  }
}

