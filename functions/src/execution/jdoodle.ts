export interface JDoodleExecuteRequest {
  script: string;
  language: string;
  stdin?: string;
}

export interface JDoodleExecuteResponse {
  output: string;
  statusCode: number;
  memory?: string;
  cpuTime?: string;
  error?: string;
}

// JDoodle language mapping and version indexes
const JDOODLE_LANGUAGE_MAP: Record<string, { language: string; versionIndex: string }> = {
  python: { language: "python3", versionIndex: "4" },
  python3: { language: "python3", versionIndex: "4" },
  cpp: { language: "cpp17", versionIndex: "1" },
  "c++": { language: "cpp17", versionIndex: "1" },
  c: { language: "c", versionIndex: "5" },
  java: { language: "java", versionIndex: "4" },
  javascript: { language: "nodejs", versionIndex: "4" },
  typescript: { language: "nodejs", versionIndex: "4" },
  rust: { language: "rust", versionIndex: "4" },
  go: { language: "go", versionIndex: "4" },
};

export async function executeCodeWithJDoodle(
  req: JDoodleExecuteRequest
): Promise<JDoodleExecuteResponse> {
  const clientId = process.env.JDOODLE_CLIENT_ID;
  const clientSecret = process.env.JDOODLE_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.includes("your_jdoodle") || clientSecret.includes("your_jdoodle")) {
    return {
      output: "[JDoodle] API credentials (JDOODLE_CLIENT_ID / JDOODLE_CLIENT_SECRET) are not configured on the server. Please set valid credentials in functions/.env or Cloud Functions secrets.",
      statusCode: 503,
      error: "CREDENTIALS_NOT_CONFIGURED",
    };
  }

  const langConfig = JDOODLE_LANGUAGE_MAP[req.language.toLowerCase()] || {
    language: req.language,
    versionIndex: "0",
  };

  const payload = {
    clientId,
    clientSecret,
    script: req.script,
    language: langConfig.language,
    versionIndex: langConfig.versionIndex,
    stdin: req.stdin || "",
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const res = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      return {
        output: `Execution error (HTTP ${res.status}): ${errText}`,
        statusCode: res.status,
        error: `HTTP_${res.status}`,
      };
    }

    const data = (await res.json()) as {
      output: string;
      statusCode: number;
      memory?: string;
      cpuTime?: string;
      error?: string;
    };

    return {
      output: data.output || "",
      statusCode: data.statusCode || 200,
      memory: data.memory,
      cpuTime: data.cpuTime,
      error: data.error,
    };
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    const isAbort = err instanceof Error && err.name === "AbortError";
    return {
      output: isAbort
        ? "Execution Timed Out: Program exceeded 15 seconds limit."
        : `JDoodle connection failure: ${err instanceof Error ? err.message : String(err)}`,
      statusCode: isAbort ? 408 : 500,
      error: isAbort ? "TIMEOUT" : "CONNECTION_ERROR",
    };
  }
}
