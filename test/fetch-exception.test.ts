/**
 * Acceptance tests for FetchException.
 */

import { describe, expect, test } from 'vitest';
import { FetchException } from '@tsnomad/fetch';

describe('FetchException', () => {
  test('carries its message, its cause and its name', () => {
    const cause = new TypeError('fetch failed');
    const error = new FetchException('Request failed: GET https://api.example.invalid/x: fetch failed', { cause });

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(FetchException);
    expect(error.message).toBe('Request failed: GET https://api.example.invalid/x: fetch failed');
    expect(error.cause).toBe(cause);
    expect(error.name).toBe('FetchException');
  });

  test('has no cause when none is given', () => {
    const error = new FetchException('Request timed out after 5 ms: GET https://api.example.invalid/x');

    expect(error.message).toBe('Request timed out after 5 ms: GET https://api.example.invalid/x');
    expect('cause' in error).toBe(false);
  });
});
