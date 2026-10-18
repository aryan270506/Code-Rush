/**
 * AI Service for Code Battle
 * Integrates Groq and Google Gemini via trusted server-side REST requests.
 */

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function callGroqChat(messages: ChatMessage[]): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes("your_groq")) {
    throw new Error("GROQ_API_KEY_NOT_CONFIGURED");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
        temperature: 0.4,
        max_tokens: 1024,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq HTTP ${res.status}: ${err}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    return data.choices?.[0]?.message?.content || "No response generated.";
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function callGeminiChat(prompt: string, systemInstruction?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes("your_gemini")) {
    throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const contents = [
    ...(systemInstruction ? [{ role: "user", parts: [{ text: systemInstruction }] }] : []),
    { role: "user", parts: [{ text: prompt }] },
  ];

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini HTTP ${res.status}: ${err}`);
    }

    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

async function runAiCompletion(systemPrompt: string, userPrompt: string): Promise<string> {
  // Try Groq first, fallback to Gemini, or vice-versa
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes("your_groq")) {
    try {
      return await callGroqChat([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ]);
    } catch (groqErr) {
      console.warn("[AIService] Groq failed, attempting Gemini fallback:", groqErr);
    }
  }

  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes("your_gemini")) {
    try {
      return await callGeminiChat(userPrompt, systemPrompt);
    } catch (geminiErr) {
      console.warn("[AIService] Gemini failed:", geminiErr);
    }
  }

  return "AI services (Groq / Gemini) are currently unavailable or credentials are not configured in environment.";
}

export async function generateAiHint(params: {
  problemTitle: string;
  problemStatement: string;
  currentCode: string;
  errorMessage?: string;
}): Promise<string> {
  const systemPrompt = `You are a competitive programming coach for Code Battle. Provide a concise, conceptual hint (maximum 3 bullet points). Do NOT give away full source code or write the complete solution. Focus on algorithmic insights, edge cases, time/space complexity, or debugging guidance.`;
  const userPrompt = `Problem: ${params.problemTitle}\n\nStatement:\n${params.problemStatement}\n\nParticipant's Code:\n\`\`\`\n${params.currentCode}\n\`\`\`\n\nExecution/Compiler Error (if any):\n${params.errorMessage || "None"}\n\nPlease give a targeted hint without solving the problem directly.`;

  return await runAiCompletion(systemPrompt, userPrompt);
}

export async function explainCodeError(params: {
  code: string;
  compilerOutput: string;
  language: string;
}): Promise<string> {
  const systemPrompt = `You are an expert compiler and runtime debugger for Code Battle. Explain the exact syntax or logic bug causing the error in concise, technical language. Point out the specific line or construct to check.`;
  const userPrompt = `Language: ${params.language}\n\nSource Code:\n\`\`\`\n${params.code}\n\`\`\`\n\nCompiler / Runtime Output:\n\`\`\`\n${params.compilerOutput}\n\`\`\`\n\nExplain why this failed and how to fix the error cleanly.`;

  return await runAiCompletion(systemPrompt, userPrompt);
}

export async function generateAiQuestion(params: {
  topic: string;
  roundType: "quiz" | "coding" | "debugging";
  difficulty: "easy" | "medium" | "hard";
}): Promise<string> {
  const systemPrompt = `You are a senior hackathon problem author for Code Battle. Generate a challenge in JSON format with title, statement, constraints, starterCode, and sample test cases.`;
  const userPrompt = `Generate a ${params.difficulty} difficulty ${params.roundType} challenge on the topic of "${params.topic}". Provide valid JSON matching Code Battle schema.`;

  return await runAiCompletion(systemPrompt, userPrompt);
}
