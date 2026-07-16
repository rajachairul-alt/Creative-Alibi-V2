/**
 * @fileoverview Unit tests for granite.service.ts
 * Uses mocked watsonx.ai API responses.
 */

import axios from 'axios';
import { generateCreativeSuggestion } from '../services/granite.service';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the watson config
jest.mock('../config/watson', () => ({
  createWatsonxClient: jest.fn().mockResolvedValue({
    post: jest.fn(),
  }),
}));

// Mock env
jest.mock('../config/env', () => ({
  getEnv: () => ({
    WATSONX_URL: 'https://us-south.ml.cloud.ibm.com',
    WATSONX_PROJECT_ID: 'test-project',
    GRANITE_MODEL_ID: 'ibm/granite-3-3b-instruct',
    GRANITE_FALLBACK_MODEL_ID: 'ibm/granite-3-8b-instruct',
    GRANITE_MAX_TOKENS: 300,
    GRANITE_TIMEOUT_MS: 30000,
  }),
}));

import { createWatsonxClient } from '../config/watson';

describe('generateCreativeSuggestion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns style suggestion with hedged language', async () => {
    const mockPost = jest.fn().mockResolvedValue({
      data: {
        model_id: 'ibm/granite-3-3b-instruct',
        results: [{
          generated_text: 'You might consider varying your sentence lengths more. One approach could be to use shorter sentences for emphasis.',
          generated_token_count: 25,
          input_token_count: 100,
          stop_reason: 'stop',
        }],
      },
    });

    (createWatsonxClient as jest.Mock).mockResolvedValue({ post: mockPost });

    const result = await generateCreativeSuggestion({
      prompt: 'How can I improve my writing style?',
      type: 'style_suggestion',
      sessionId: 'test-session',
      documentContext: 'The quick brown fox jumps over the lazy dog.',
      wordCount: 150,
    });

    expect(result.suggestion).toBeTruthy();
    expect(result.guardianApproved).toBe(true);
    expect(result.eventId).toBeTruthy();
    expect(result.type).toBe('style_suggestion');
    expect(result.disclaimerText).toContain('IBM Granite');
  });

  test('returns brainstorm with multiple ideas', async () => {
    const mockPost = jest.fn().mockResolvedValue({
      data: {
        model_id: 'ibm/granite-3-3b-instruct',
        results: [{
          generated_text: '1. What if you opened with a question?\n2. Consider using a case study.\n3. Another angle could be exploring the counterargument.\n4. You might try a narrative structure.',
          generated_token_count: 40,
          input_token_count: 120,
          stop_reason: 'stop',
        }],
      },
    });

    (createWatsonxClient as jest.Mock).mockResolvedValue({ post: mockPost });

    const result = await generateCreativeSuggestion({
      prompt: 'Give me ideas for my conclusion',
      type: 'brainstorm',
      sessionId: 'test-session',
      documentContext: 'In conclusion, the results suggest...',
      wordCount: 500,
    });

    expect(result.suggestion).toContain('1.');
    expect(result.type).toBe('brainstorm');
    expect(result.guardianApproved).toBe(true);
  });

  test('handles Granite API failure gracefully', async () => {
    (createWatsonxClient as jest.Mock).mockRejectedValue(new Error('Network error'));

    await expect(generateCreativeSuggestion({
      prompt: 'test',
      type: 'general',
      sessionId: 'test',
      documentContext: '',
      wordCount: 100,
    })).rejects.toThrow('IBM Granite unavailable');
  });

  test('Guardian rejects directive response and returns fallback', async () => {
    const mockPost = jest.fn().mockResolvedValue({
      data: {
        model_id: 'ibm/granite-3-3b-instruct',
        results: [{
          generated_text: 'Write: Here is a completely rewritten paragraph that will definitely work much better for your audience and should be used verbatim.',
          generated_token_count: 30,
          input_token_count: 80,
          stop_reason: 'stop',
        }],
      },
    });

    (createWatsonxClient as jest.Mock).mockResolvedValue({ post: mockPost });

    const result = await generateCreativeSuggestion({
      prompt: 'rewrite my paragraph',
      type: 'style_suggestion',
      sessionId: 'test-session',
      documentContext: 'My paragraph...',
      wordCount: 200,
    });

    // Guardian should have rejected the directive response
    expect(result.guardianApproved).toBe(false);
    // Should return safe fallback instead of the rejected content
    expect(result.suggestion).not.toContain('Write:');
  });
});
