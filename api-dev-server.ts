// api-dev-server.ts

import express from 'express';
import 'dotenv/config'; // Loads variables from .env file
import Groq from 'groq-sdk';

const app = express();
const port = 3001; // We'll run the API on a separate port

app.use(express.json());

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  throw new Error("GROQ_API_KEY is not set in the .env file.");
}
const groq = new Groq({ apiKey: groqApiKey });

// This endpoint matches your Vercel Function path
app.post('/api/generate-tasks', async (req, res) => {
  console.log('Local API server received a request.');
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    
    const fullPrompt = `Generate a list of 3-5 todo tasks based on the following prompt: "${prompt}". The output should be a clean, unformatted list of tasks. Each task should be separated by a comma. For example: "Write a blog post about Next.js, Research new front-end frameworks, Deploy the project to Vercel". Do not include any markdown, numbering, or bullet points.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: fullPrompt }],
      model: "llama-3.1-8b-instant",
    });

    const text = chatCompletion.choices[0]?.message?.content || "";
    const tasks = text.split(",").map((task) => task.trim()).filter(Boolean);

    res.status(200).json({ tasks });
  } catch (error) {
    console.error("Error in local API server:", error);
    res.status(500).json({ error: "Failed to generate tasks" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Local API server listening on http://localhost:${port}`);
});