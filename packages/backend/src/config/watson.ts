/**
 * @fileoverview IBM watsonx.ai client configuration and IAM token management.
 * Handles Bearer token caching with automatic refresh.
 */

import axios from 'axios';
import { getEnv } from './env';

interface IAMTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  expiration: number;
}

interface CachedToken {
  token: string;
  expiresAt: number; // Unix timestamp ms
}

let _cachedToken: CachedToken | null = null;

/**
 * Obtains a fresh IBM IAM Bearer token using the configured API key.
 * Tokens are cached and reused until they expire (with a 60s buffer).
 */
export async function getWatsonxToken(): Promise<string> {
  const env = getEnv();
  const now = Date.now();

  // Return cached token if still valid (with 60s buffer)
  if (_cachedToken && _cachedToken.expiresAt > now + 60_000) {
    return _cachedToken.token;
  }

  try {
    const response = await axios.post<IAMTokenResponse>(
      env.WATSONX_IAM_URL,
      new URLSearchParams({
        grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
        apikey: env.WATSONX_API_KEY,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 10_000,
      }
    );

    const { access_token, expires_in } = response.data;

    _cachedToken = {
      token: access_token,
      expiresAt: now + (expires_in * 1_000),
    };

    return access_token;
  } catch (error) {
    throw new Error(`Failed to obtain IBM IAM token: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Creates a configured Axios instance for watsonx.ai API calls.
 */
export async function createWatsonxClient() {
  const env = getEnv();
  const token = await getWatsonxToken();

  return axios.create({
    baseURL: env.WATSONX_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    timeout: env.GRANITE_TIMEOUT_MS,
  });
}
