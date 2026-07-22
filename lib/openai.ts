import { randomUUID } from "node:crypto";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

type OpenAIResponse = {
  status?: string;
  output?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      text?: string;
      refusal?: string;
    }>;
  }>;
  error?: { message?: string };
};

function apiKey() {
  const value = process.env.OPENAI_API_KEY?.trim();
  if (!value) throw new Error("MISSING_OPENAI_API_KEY");
  return value;
}

export function openAiIsConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function openAiModel() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-5-mini";
}

function extractOutputText(response: OpenAIResponse) {
  for (const item of response.output ?? []) {
    for (const content of item.content ?? []) {
      if (content.type === "refusal" && content.refusal) throw new Error("OPENAI_REFUSAL");
      if (content.type === "output_text" && content.text) return content.text;
    }
  }
  throw new Error("OPENAI_EMPTY_OUTPUT");
}

export async function createStructuredResponse<T>(input: {
  schemaName: string;
  schema: Record<string, unknown>;
  instructions: string;
  payload: Record<string, unknown>;
  maxOutputTokens?: number;
}): Promise<T> {
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      "X-Client-Request-Id": randomUUID()
    },
    body: JSON.stringify({
      model: openAiModel(),
      store: false,
      instructions: input.instructions,
      input: [{
        role: "user",
        content: [{ type: "input_text", text: JSON.stringify(input.payload) }]
      }],
      reasoning: { effort: "low" },
      max_output_tokens: input.maxOutputTokens ?? 1600,
      text: {
        format: {
          type: "json_schema",
          name: input.schemaName,
          strict: true,
          schema: input.schema
        }
      }
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(30_000)
  });

  const raw = await response.text();
  let document: OpenAIResponse;
  try {
    document = JSON.parse(raw) as OpenAIResponse;
  } catch {
    throw new Error(`OPENAI_INVALID_JSON_${response.status}`);
  }
  if (!response.ok) throw new Error(`OPENAI_${response.status}: ${document.error?.message ?? "Request failed"}`);
  if (document.status && document.status !== "completed") throw new Error(`OPENAI_${document.status.toUpperCase()}`);

  const text = extractOutputText(document);
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("OPENAI_INVALID_STRUCTURED_OUTPUT");
  }
}
