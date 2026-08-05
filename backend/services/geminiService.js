import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const askGemini = async (context, question) => {
  const prompt = `
You are an Enterprise Knowledge Assistant.

Answer ONLY from the document below.

If the answer is not present in the document, reply exactly:

"I couldn't find that information in the uploaded document."

DOCUMENT:
${context}

QUESTION:
${question}
`;

  const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "system",
      content: `
You are an AI assistant that answers questions ONLY using the uploaded document.

Formatting Rules:
- Always respond in GitHub Flavored Markdown.
- Use headings (##) for sections.
- Use bullet points for lists.
- Use numbered lists for step-by-step explanations.
- Use Markdown tables whenever comparing information.
- Use fenced code blocks (\`\`\`) for code.
- Keep answers concise, well-structured, and easy to read.
- If the answer is not present in the document, reply:
"I couldn't find that information in the uploaded document."
`,
    },
    {
      role: "user",
      content: prompt,
    },
  ],
  temperature: 0.2,
});

  return completion.choices[0].message.content;
};