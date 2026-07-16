/**
 * @fileoverview IBM Granite AI Creative Partner service.
 * Integrates with IBM watsonx.ai REST API to provide style suggestions,
 * brainstorming, and grammar assistance.
 *
 * Every call is logged to the Process Ledger — never silent.
 * IBM Granite 3.3B Instruct (or 8B fallback) via watsonx.ai.
 */

import { v4 as uuidv4 } from 'uuid';
import { createWatsonxClient } from '../config/watson';
import { getEnv } from '../config/env';
import { validateGuardian } from './guardian.service';
import type { AIPartnerRequest, AIPartnerResponse, AIAssistType } from '../../../shared/src/types';
import {
  GRANITE_TEMPERATURE_STYLE,
  GRANITE_TEMPERATURE_BRAINSTORM,
  GRANITE_TEMPERATURE_GRAMMAR,
  GRANITE_CONTEXT_MAX_CHARS,
  AI_ASSIST_DISCLOSURE_TEXT,
} from '../../../shared/src/constants';

// ─── System Prompts ────────────────────────────────────────────────────────────

const SYSTEM_PROMPTS: Record<AIAssistType, string> = {
  style_suggestion: `You are an AI Creative Partner embedded in a professional writing tool.
Your role: provide STYLE suggestions to a human writer who is actively composing their own work.

STRICT RULES:
- Offer suggestions, never write FOR the author
- Always phrase as options: "You might consider...", "One approach could be...", "Perhaps..."
- Comment only on voice, rhythm, word choice, and sentence structure
- Keep your response under 100 words
- Do NOT generate complete sentences the writer should copy verbatim
- Do NOT reproduce the writer's text back with minor changes
- This writer's work is being logged for an Authenticity Report — your assistance will be disclosed

Respond with 2-3 concrete style suggestions in bullet points.`,

  brainstorm: `You are an AI Creative Partner embedded in a professional writing tool.
Your role: provide BRAINSTORMING ideas to a human writer who is actively composing their own work.

STRICT RULES:
- Generate 3-5 distinct directions or ideas, not finished prose
- Each idea should be 1-2 sentences maximum
- Frame all ideas as options: "What if...", "Another angle could be...", "Consider exploring..."
- Do NOT write paragraphs or full sections
- Do NOT tell the writer what to write — spark their own thinking
- This writer's work is being logged for an Authenticity Report — your assistance will be disclosed

Respond with 3-5 numbered brainstorm ideas.`,

  grammar_check: `You are an AI Creative Partner embedded in a professional writing tool.
Your role: identify GRAMMAR and CLARITY issues in the provided text excerpt.

STRICT RULES:
- List specific issues you notice
- For each issue: quote the problem text and explain why it's an issue
- Suggest a correction, but phrase it as an option: "Could be revised to..."
- Keep total response under 120 words
- Do NOT rewrite full paragraphs
- This writer's work is being logged for an Authenticity Report — your assistance will be disclosed

Respond with a numbered list of grammar/clarity notes.`,

  general: `You are an AI Creative Partner embedded in a professional writing tool.
Your role: assist a human writer with their writing process.

STRICT RULES:
- Offer assistance, never do the writing for the author
- Always phrase suggestions as options using hedging language
- Keep your response concise and under 120 words
- This writer's work is being logged for an Authenticity Report — your assistance will be disclosed`,
};

// ─── Temperature Map ───────────────────────────────────────────────────────────

const TEMPERATURE_MAP: Record<AIAssistType, number> = {
  style_suggestion: GRANITE_TEMPERATURE_STYLE,
  brainstorm: GRANITE_TEMPERATURE_BRAINSTORM,
  grammar_check: GRANITE_TEMPERATURE_GRAMMAR,
  general: 0.5,
};

// ─── watsonx.ai Request Types ──────────────────────────────────────────────────

interface WatsonxTextGenRequest {
  model_id: string;
  input: string;
  parameters: {
    max_new_tokens: number;
    temperature: number;
    top_p: number;
    repetition_penalty: number;
    stop_sequences: string[];
  };
  project_id: string;
}

interface WatsonxTextGenResponse {
  model_id: string;
  created_at: string;
  results: Array<{
    generated_text: string;
    generated_token_count: number;
    input_token_count: number;
    stop_reason: string;
  }>;
}

// ─── Main Service Function ─────────────────────────────────────────────────────

/**
 * Calls IBM Granite via watsonx.ai to generate a Creative Partner suggestion.
 * Every call is assigned an event ID that will be logged in the Process Ledger.
 *
 * @param request - The AI partner request from the writer
 * @returns AIPartnerResponse with suggestion, disclosure info, and event ID
 * @throws Error if Granite call fails or Guardian rejects the response
 */
export async function generateCreativeSuggestion(
  request: AIPartnerRequest
): Promise<AIPartnerResponse> {
  const env = getEnv();
  const eventId = uuidv4();
  const systemPrompt = SYSTEM_PROMPTS[request.type];
  const temperature = TEMPERATURE_MAP[request.type];

  // Truncate document context to prevent over-reliance on writer's text
  const contextSnippet = request.documentContext.slice(-GRANITE_CONTEXT_MAX_CHARS);

  const fullPrompt = buildGranitePrompt(systemPrompt, request.prompt, contextSnippet, request.type);

  const watsonxRequest: WatsonxTextGenRequest = {
    model_id: env.GRANITE_MODEL_ID,
    input: fullPrompt,
    parameters: {
      max_new_tokens: env.GRANITE_MAX_TOKENS,
      temperature,
      top_p: 0.85,
      repetition_penalty: 1.1,
      stop_sequences: ['\n\n\n', '<|endoftext|>'],
    },
    project_id: env.WATSONX_PROJECT_ID,
  };

  let rawSuggestion: string;
  let modelUsed: string;

  try {
    const client = await createWatsonxClient();
    const response = await client.post<WatsonxTextGenResponse>(
      '/ml/v1/text/generation?version=2023-05-29',
      watsonxRequest
    );

    if (!response.data.results || response.data.results.length === 0) {
      throw new Error('No results returned from IBM Granite');
    }

    rawSuggestion = response.data.results[0].generated_text.trim();
    modelUsed = response.data.model_id;

  } catch (primaryError) {
    // Attempt fallback to granite-3-8b-instruct
    console.warn('[Granite] Primary model failed, attempting fallback:', primaryError);
    try {
      const client = await createWatsonxClient();
      const fallbackRequest = { ...watsonxRequest, model_id: env.GRANITE_FALLBACK_MODEL_ID };
      const response = await client.post<WatsonxTextGenResponse>(
        '/ml/v1/text/generation?version=2023-05-29',
        fallbackRequest
      );
      rawSuggestion = response.data.results[0].generated_text.trim();
      modelUsed = response.data.model_id;
    } catch (fallbackError) {
      throw new Error(`IBM Granite unavailable: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`);
    }
  }

  // ─── Granite Guardian Validation ─────────────────────────────────────────
  const guardianResult = validateGuardian(rawSuggestion, request.type);

  if (!guardianResult.approved) {
    console.warn('[Guardian] Suggestion rejected:', guardianResult.reason);
    // Return a safe fallback message
    return {
      suggestion: `I can help with ${request.type.replace('_', ' ')}. Could you share the specific aspect of your writing you'd like to explore? I'll offer some directions to consider.`,
      type: request.type,
      confidence: 0.5,
      disclaimerText: AI_ASSIST_DISCLOSURE_TEXT,
      guardianApproved: false,
      modelId: modelUsed!,
      eventId,
    };
  }

  return {
    suggestion: rawSuggestion,
    type: request.type,
    confidence: guardianResult.confidence,
    disclaimerText: AI_ASSIST_DISCLOSURE_TEXT,
    guardianApproved: true,
    modelId: modelUsed!,
    eventId,
  };
}

// ─── Prompt Builder ────────────────────────────────────────────────────────────

function buildGranitePrompt(
  systemPrompt: string,
  userPrompt: string,
  contextSnippet: string,
  type: AIAssistType
): string {
  const contextSection = contextSnippet
    ? `\n\n[CURRENT WRITING CONTEXT — last ${contextSnippet.length} characters]\n"...${contextSnippet}"\n[END CONTEXT]\n\n`
    : '';

  return `<|system|>
${systemPrompt}
<|user|>
${contextSection}Writer's request (${type.replace('_', ' ')}): ${userPrompt}
<|assistant|>`;
}
