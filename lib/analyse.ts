import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { createClient, toFriendlyError, type FriendlyError } from "./anthropic";
import { buildUserMessage, SYSTEM_PROMPT } from "./prompt";
import { AnalysisSchema, type Analysis, type AnalysisInput } from "./schema";

export type Stage = "thinking" | "summary" | "tasks" | "skills" | "plan" | "finishing";

export type AnalyseResult = { ok: true; analysis: Analysis } | { ok: false; error: FriendlyError };

/** Thrown when Claude's reply doesn't match the schema (we retry once). */
class InvalidOutputError extends Error {}
/** Claude declined the request (stop_reason "refusal"). */
class RefusalError extends Error {}

const STAGE_MARKERS: [string, Stage][] = [
  ['"encouragement"', "finishing"],
  ['"plan_30_days"', "plan"],
  ['"skills_to_build"', "skills"],
  ['"tasks"', "tasks"],
  ['"role_summary"', "summary"],
];

async function attempt(
  client: Anthropic,
  input: AnalysisInput,
  signal: AbortSignal | undefined,
  onStage: (s: Stage) => void,
): Promise<Analysis> {
  const stream = client.messages.stream(
    {
      model: input.model,
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: buildUserMessage(input) }],
      output_config: { effort: "low", format: zodOutputFormat(AnalysisSchema) },
    },
    { signal },
  );

  // Show progress as each section of the JSON starts streaming in.
  let text = "";
  let stage: Stage = "thinking";
  stream.on("text", (delta) => {
    text += delta;
    const found = STAGE_MARKERS.find(([marker]) => text.includes(marker))?.[1];
    if (found && found !== stage) {
      stage = found;
      onStage(found);
    }
  });

  let message;
  try {
    message = await stream.finalMessage();
  } catch (err) {
    // The SDK's own schema check failed: a plain AnthropicError, not an API error.
    if (err instanceof Anthropic.AnthropicError && !(err instanceof Anthropic.APIError)) {
      throw new InvalidOutputError();
    }
    throw err;
  }

  if (message.stop_reason === "refusal") throw new RefusalError();
  if (message.stop_reason === "max_tokens") throw new InvalidOutputError();

  // Validate again ourselves: this is the gate for everything we render.
  const parsed = AnalysisSchema.safeParse(message.parsed_output);
  if (!parsed.success) throw new InvalidOutputError();
  return parsed.data;
}

export async function analyseJob(
  apiKey: string,
  input: AnalysisInput,
  opts: { signal?: AbortSignal; onStage?: (s: Stage) => void } = {},
): Promise<AnalyseResult> {
  const client = createClient(apiKey);
  const onStage = opts.onStage ?? (() => {});

  for (let tryNo = 1; tryNo <= 2; tryNo++) {
    try {
      onStage("thinking");
      return { ok: true, analysis: await attempt(client, input, opts.signal, onStage) };
    } catch (err) {
      if (err instanceof InvalidOutputError && tryNo === 1) continue; // retry once
      if (err instanceof InvalidOutputError) {
        return {
          ok: false,
          error: {
            kind: "unknown",
            title: "The answer came back incomplete",
            message: "Claude's reply didn't have the expected shape, even after a retry. Please try again, or try the other model in the form.",
          },
        };
      }
      if (err instanceof RefusalError) {
        return {
          ok: false,
          error: {
            kind: "bad_request",
            title: "We couldn't analyse that",
            message: "Claude declined this request. Try rephrasing your job title or shortening the job description.",
          },
        };
      }
      if (err instanceof Anthropic.APIUserAbortError || opts.signal?.aborted) {
        return { ok: false, error: { kind: "cancelled", title: "Cancelled", message: "You stopped the analysis." } };
      }
      return { ok: false, error: toFriendlyError(err) };
    }
  }
  // Unreachable, but keeps TypeScript happy.
  return { ok: false, error: toFriendlyError(null) };
}
