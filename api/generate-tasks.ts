// api/generate-tasks.ts

import type { VercelRequest, VercelResponse } from "@vercel/node";
import Groq from "groq-sdk";

const groqApiKey = process.env.GROQ_API_KEY;

// It's better to check for the key inside the handler to avoid startup crashes
// but for now, ensuring it's in your .env.development.local will work.

const groq = new Groq({ apiKey: groqApiKey });

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (!groqApiKey) {
    // You can also check for the key here for a cleaner error message
    return res.status(500).json({ error: "API key is not configured." });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

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
    console.error("Error in generate-tasks API route:", error);
    res.status(500).json({
      error: "Failed to generate tasks",
      details:
        error instanceof Error ? error.message : "An unknown error occurred",
    });
  }
}