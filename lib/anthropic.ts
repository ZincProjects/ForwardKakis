import Anthropic from "@anthropic-ai/sdk";

/**
 * Browser-side Anthropic client. Requests go straight from the user's browser
 * to https://api.anthropic.com. Our server never sees the key.
 */
export function createClient(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
    maxRetries: 1,
    logLevel: "off", // never let the SDK log requests/headers to the console
  });
}

export interface FriendlyError {
  kind: "invalid_key" | "rate_limit" | "no_credit" | "network" | "overloaded" | "permission" | "bad_request" | "cancelled" | "unknown";
  title: string;
  message: string;
}

/**
 * Turn any thrown error into a friendly message. We deliberately never echo
 * raw error text, request details or headers, so the key cannot leak here.
 */
export function toFriendlyError(err: unknown): FriendlyError {
  // Order matters: APIConnectionError is a subclass of APIError.
  if (err instanceof Anthropic.APIConnectionError) {
    return {
      kind: "network",
      title: "Couldn't reach Anthropic",
      message: "Please check your internet connection and try again. If you're on office Wi-Fi, it may block AI services.",
    };
  }
  if (err instanceof Anthropic.AuthenticationError) {
    return {
      kind: "invalid_key",
      title: "That API key didn't work",
      message: "Anthropic says the key is invalid. Check you copied the whole key, or create a new one at console.anthropic.com.",
    };
  }
  if (err instanceof Anthropic.RateLimitError) {
    return {
      kind: "rate_limit",
      title: "Too many requests right now",
      message: "Your key has hit its rate limit. Please wait a minute and try again.",
    };
  }
  if (err instanceof Anthropic.PermissionDeniedError) {
    return {
      kind: "permission",
      title: "This key isn't allowed to do that",
      message: "Your key doesn't have permission to use this model. Check your workspace settings at console.anthropic.com.",
    };
  }
  if (err instanceof Anthropic.APIError) {
    const lowCredit =
      err.status === 402 ||
      err.type === "billing_error" ||
      // Anthropic reports an empty balance as a 400 with this wording.
      (err.status === 400 && /credit balance/i.test(err.message));
    if (lowCredit) {
      return {
        kind: "no_credit",
        title: "Your Anthropic account needs credit",
        message: "The key works, but there isn't enough credit on the account. Add credit under Billing at console.anthropic.com.",
      };
    }
    if (err.status === 529 || err.type === "overloaded_error" || (err.status ?? 0) >= 500) {
      return {
        kind: "overloaded",
        title: "Anthropic is busy",
        message: "The service is under heavy load. Please try again in a moment.",
      };
    }
    if (err.status === 400 || err.status === 404) {
      return {
        kind: "bad_request",
        title: "The request was rejected",
        message: "Something about the request wasn't accepted. Try the other model in Settings, or try again later.",
      };
    }
  }
  return {
    kind: "unknown",
    title: "Something went wrong",
    message: "An unexpected error happened. Please try again.",
  };
}

export const TEST_MODEL = "claude-haiku-5-5";

/** Minimal, very cheap call to check the key works and the account has credit. */
export async function testKey(apiKey: string): Promise<{ ok: true } | { ok: false; error: FriendlyError }> {
  try {
    await createClient(apiKey).messages.create({
      model: TEST_MODEL,
      max_tokens: 16,
      messages: [{ role: "user", content: "Reply with OK." }],
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: toFriendlyError(err) };
  }
}
