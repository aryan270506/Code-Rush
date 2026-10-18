/**
 * Code Battle — Google Gemini AI Question Generation Service
 * 
 * Generates competitive programming challenges, algorithmic MCQs, debugging bugs,
 * and championship problems directly via Google Gemini, then persists them to
 * Firebase Realtime Database.
 */

import { ref, set } from "firebase/database";
import { rtdb } from "../lib/firebase";
import { DEFAULT_COMPETITION_ID } from "./realtimeDbService";
import { adminDataService } from "./adminDataService";
import type { Question, QuestionDifficulty } from "../types/admin";

const GEMINI_API_KEY =
  import.meta.env.VITE_GEMINI_API_KEY ||
  import.meta.env.GEMINI_API_KEY ||
  "AIzaSyCbnu2ZRk-fXAU4LnfFxnoeUEuPkq36ZIk";

const GEMINI_MODEL = "gemini-flash-latest";

export interface GenerateGeminiQuestionOptions {
  roundType: "quiz" | "coding" | "debugging" | "final";
  difficulty: QuestionDifficulty;
  topic?: string;
  count?: number; // 1 to 5 questions
  competitionId?: string;
}

export interface GeneratedQuestionResult {
  id: string;
  title: string;
  roundName: string;
  type: string;
  difficulty: string;
  points: number;
  statement: string;
  options?: Array<{ id: string; text: string }>;
  correctAnswer?: string;
  explanation?: string;
  inputFormat?: string;
  outputFormat?: string;
  constraints?: string;
  sampleCases?: Array<{ id?: string; input: string; output: string; explanation?: string }>;
  starterCode?: Record<string, string>;
  solutionCode?: string;
  buggyCode?: string;
  status: "published";
  tags: string[];
}

export const geminiService = {
  /**
   * Generates questions using Google Gemini Flash model and saves them to Realtime Database.
   */
  async generateAndSaveQuestions(
    options: GenerateGeminiQuestionOptions,
    onProgress?: (step: string) => void
  ): Promise<GeneratedQuestionResult[]> {
    const {
      roundType,
      difficulty,
      topic = "Competitive Programming & Data Structures",
      count = 1,
      competitionId = DEFAULT_COMPETITION_ID,
    } = options;

    onProgress?.("Contacting Google Gemini API...");

    const roundNameMap: Record<string, string> = {
      quiz: "Quiz Battle",
      coding: "Coding Battle",
      debugging: "Debugging Battle",
      final: "Final Battle",
    };
    const roundTitle = roundNameMap[roundType] || "Coding Battle";

    const prompt = `You are a World-Class Competitive Programming Problem Setter (like Codeforces / LeetCode Hard / ICPC World Finals).
Generate exactly ${count} ${difficulty.toUpperCase()} difficulty question(s) for the round: "${roundTitle}" (${roundType}).
Specific Topic/Domain: "${topic}".

Format your entire response as a valid JSON array of objects. Do not wrap with any commentary outside the JSON array.
Each object in the array must follow this exact JSON specification according to the round type:

IF roundType is "quiz":
{
  "title": "Short descriptive question title",
  "statement": "Detailed multiple-choice question testing algorithms, time complexity, or data structures",
  "options": [
    {"id": "opt_a", "text": "Option A content"},
    {"id": "opt_b", "text": "Option B content"},
    {"id": "opt_c", "text": "Option C content"},
    {"id": "opt_d", "text": "Option D content"}
  ],
  "correctAnswer": "opt_a", // or opt_b, opt_c, opt_d
  "explanation": "Clear explanation of why this is the correct answer and why others are incorrect",
  "points": 10,
  "tags": ["topic1", "topic2"]
}

IF roundType is "coding":
{
  "title": "Problem Title",
  "statement": "Complete, rigorous problem story, specifications, and requirements in Markdown format",
  "inputFormat": "Explanation of input structure and types",
  "outputFormat": "Explanation of required output",
  "constraints": "1 <= N <= 10^5, Time limit: 2000ms, Memory limit: 256MB",
  "points": 100,
  "sampleCases": [
    {
      "input": "Sample stdin input line 1\\nline 2",
      "output": "Expected stdout output",
      "explanation": "Walkthrough of how sample produces this output"
    }
  ],
  "starterCode": {
    "python": "import sys\\n\\ndef solve():\\n    # write code here\\n    pass\\n\\nif __name__ == '__main__':\\n    solve()\\n",
    "javascript": "const fs = require('fs');\\n\\nfunction solve() {\\n  // write code here\\n}\\n\\nsolve();\\n",
    "cpp": "#include <iostream>\\n#include <vector>\\n\\nusing namespace std;\\n\\nint main() {\\n    ios_base::sync_with_stdio(false);\\n    cin.tie(NULL);\\n    return 0;\\n}\\n"
  },
  "solutionCode": "def solve():\\n    # Authoritative optimal solution\\n    pass\\n",
  "tags": ["arrays", "greedy", "dp"]
}

IF roundType is "debugging":
{
  "title": "Debug: Problem Title",
  "statement": "Bug report and specification: Describe what the algorithm is intended to do, and the edge cases where it currently fails (e.g. infinite loop, off-by-one, integer overflow)",
  "buggyCode": "def buggy_function(arr):\\n    # Flawed implementation with a realistic subtle bug\\n    pass\\n",
  "explanation": "Detailed explanation of the exact bug, invariant violation, and how to repair it",
  "solutionCode": "def buggy_function(arr):\\n    # Repaired working solution\\n    pass\\n",
  "inputFormat": "Input specification",
  "outputFormat": "Expected output",
  "constraints": "0 <= N <= 10^5",
  "points": 75,
  "sampleCases": [
    {"input": "Sample input", "output": "Expected output", "explanation": "Explanation"}
  ],
  "tags": ["debugging", "binary-search"]
}

IF roundType is "final":
{
  "title": "Championship: Problem Title",
  "statement": "Advanced, championship-tier algorithmic challenge involving graphs, network flows, segment trees, or distributed optimization",
  "inputFormat": "Input specification",
  "outputFormat": "Output specification",
  "constraints": "1 <= N <= 2500, 1 <= M <= 10000",
  "points": 300,
  "sampleCases": [
    {"input": "Sample input", "output": "Sample output", "explanation": "Explanation"}
  ],
  "starterCode": {
    "python": "def solve():\\n    pass\\n"
  },
  "solutionCode": "def solve():\\n    pass\\n",
  "tags": ["advanced-graphs", "championship"]
}

Generate realistic, high-quality, professional hackathon-grade questions now.`;

    onProgress?.("Generating questions with Google Gemini Flash...");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Google Gemini API error (${response.status}): ${errText}`);
    }

    const resJson = await response.json();
    const candidateText =
      resJson?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!candidateText) {
      throw new Error("Gemini returned an empty response.");
    }

    onProgress?.("Parsing and structuring generated challenges...");

    // Strip markdown code fences if Gemini added them (e.g. ```json ... ```)
    let cleaned = candidateText.trim();
    if (cleaned.startsWith("```json")) {
      cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let parsedQuestions: any[] = [];
    try {
      const parsed = JSON.parse(cleaned);
      parsedQuestions = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // Fallback regex extraction if there are surrounding characters
      const match = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        parsedQuestions = JSON.parse(match[0]);
      } else {
        const singleMatch = cleaned.match(/\{[\s\S]*\}/);
        if (singleMatch) {
          parsedQuestions = [JSON.parse(singleMatch[0])];
        } else {
          throw new Error("Could not parse JSON response from Gemini: " + cleaned.slice(0, 200));
        }
      }
    }

    onProgress?.("Saving generated questions to Firebase Realtime Database...");

    const results: GeneratedQuestionResult[] = [];

    for (let i = 0; i < parsedQuestions.length; i++) {
      const q = parsedQuestions[i];
      const timestampId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      const questionId = `gemini-${roundType}-${timestampId}-${i + 1}`;

      const finalRecord: GeneratedQuestionResult = {
        id: questionId,
        title: q.title || `Gemini Challenge: ${topic}`,
        roundName: roundTitle,
        type: roundType,
        difficulty: q.difficulty || difficulty,
        points: Number(q.points) || (roundType === "quiz" ? 10 : roundType === "coding" ? 100 : roundType === "debugging" ? 75 : 300),
        statement: q.statement || q.description || "",
        options: q.options || (roundType === "quiz" ? [
          { id: "opt_a", text: "Option A" },
          { id: "opt_b", text: "Option B" },
          { id: "opt_c", text: "Option C" },
          { id: "opt_d", text: "Option D" },
        ] : undefined),
        correctAnswer: q.correctAnswer || "opt_a",
        explanation: q.explanation || "",
        inputFormat: q.inputFormat || "",
        outputFormat: q.outputFormat || "",
        constraints: q.constraints || "1 <= N <= 10^5",
        sampleCases: q.sampleCases || (q.sampleTestCases ? q.sampleTestCases.map((tc: any) => ({
          input: tc.input,
          output: tc.output || tc.expectedOutput,
          explanation: tc.explanation,
        })) : []),
        starterCode: q.starterCode || {},
        solutionCode: q.solutionCode || "",
        buggyCode: q.buggyCode || "",
        status: "published",
        tags: Array.isArray(q.tags) ? q.tags : ["ai-generated", "gemini", roundType],
      };

      // 1. Write directly to Realtime Database at questions/{competitionId}/{questionId}
      await set(ref(rtdb, `questions/${competitionId}/${questionId}`), {
        ...finalRecord,
        competitionId,
        marks: finalRecord.points,
        createdAt: new Date().toISOString(),
      });

      // 2. Add to adminDataService in-memory questions cache for instant display
      const adminQ: Omit<Question, 'id' | 'createdAt'> = {
        title: finalRecord.title,
        round: roundTitle as any,
        difficulty: finalRecord.difficulty as any,
        type: (roundType === "quiz" ? "quiz" : roundType) as any,
        marks: finalRecord.points,
        description: finalRecord.statement,
        inputDescription: finalRecord.inputFormat,
        outputDescription: finalRecord.outputFormat,
        constraints: finalRecord.constraints,
        options: (finalRecord.options || []).map((o) => o.text),
        correctAnswer: finalRecord.correctAnswer,
        explanation: finalRecord.explanation,
        buggyCode: finalRecord.buggyCode,
        solutionCode: finalRecord.solutionCode,
        supportedLanguages: ["C++", "Python", "Java", "JavaScript"],
        sampleTestCases: (finalRecord.sampleCases || []).map((sc, scIdx) => ({
          id: `sample-${scIdx + 1}`,
          input: sc.input,
          expectedOutput: sc.output,
          isHidden: false,
          weight: 20,
          explanation: sc.explanation,
        })),
        hiddenTestCases: [],
        executionTimeLimitMs: 2000,
        memoryLimitMb: 512,
        partialScoring: true,
      };
      adminDataService.addQuestion(adminQ);

      results.push(finalRecord);
    }

    onProgress?.("Completed!");
    return results;
  },
};

export default geminiService;
