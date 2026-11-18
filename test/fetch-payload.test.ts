/**
 * Acceptance tests for FetchPayload.
 */

import { describe, expect, test } from 'vitest';
import { FetchPayload } from '@tsnomad/fetch';

describe('FetchPayload', () => {
  test('answers what the constructor was given', () => {
    const payload = new FetchPayload(
      'https://api.example.invalid/orders',
      '{"a":1}',
      'POST',
      { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
      { page: 2, active: true, q: 'x' },
      1500,
    );

    expect(payload.getUrl()).toBe('https://api.example.invalid/orders');
    expect(payload.getBody()).toBe('{"a":1}');
    expect(payload.getMethod()).toBe('POST');
    expect(payload.getHeaders()).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer t' });
    expect(payload.getHeader('Content-Type')).toBe('application/json');
    expect(payload.getParams()).toEqual({ page: 2, active: true, q: 'x' });
    expect(payload.getParam('page')).toBe(2);
    expect(payload.getParam('active')).toBe(true);
    expect(payload.getTimeout()).toBe(1500);
  });

  test("defaults to GET, no headers, no params and the strategy's timeout", () => {
    const payload = new FetchPayload('https://api.example.invalid/ping', null);

    expect(payload.getMethod()).toBe('GET');
    expect(payload.getBody()).toBeNull();
    expect(payload.getHeaders()).toEqual({});
    expect(payload.getParams()).toEqual({});
    expect(payload.getTimeout()).toBeNull();
  });

  test('answers null for a header or param it does not hold, and matches names exactly', () => {
    const payload = new FetchPayload('https://api.example.invalid/', null, 'GET', { 'X-Id': '1' }, { a: 'b' });

    expect(payload.getHeader('X-Missing')).toBeNull();
    expect(payload.getHeader('x-id')).toBeNull();
    expect(payload.getParam('missing')).toBeNull();
    expect(payload.getParam('A')).toBeNull();
  });

  test("keeps its own copies, so neither the caller's objects nor the getters' answers change it", () => {
    const headers: Record<string, string> = { 'X-Id': '1' };
    const params: Record<string, string> = { a: 'b' };
    const payload = new FetchPayload('https://api.example.invalid/', null, 'GET', headers, params);

    headers['X-Id'] = 'changed';
    headers['X-New'] = 'added';
    params.a = 'changed';
    payload.getHeaders()['X-Id'] = 'changed through the getter';
    payload.getParams().a = 'changed through the getter';

    expect(payload.getHeaders()).toEqual({ 'X-Id': '1' });
    expect(payload.getParams()).toEqual({ a: 'b' });
  });

  test('refuses a timeout that is not a number above zero and at most 2147483647', () => {
    for (const timeout of [0, -1, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY, 2_147_483_648]) {
      expect(() => new FetchPayload('https://api.example.invalid/', null, 'GET', {}, {}, timeout), String(timeout)).toThrow(RangeError);
    }
    expect(() => new FetchPayload('https://api.example.invalid/', null, 'GET', {}, {}, '100' as never)).toThrow(RangeError);
    expect(new FetchPayload('https://api.example.invalid/', null, 'GET', {}, {}, 0.5).getTimeout()).toBe(0.5);
    expect(new FetchPayload('https://api.example.invalid/', null, 'GET', {}, {}, 2_147_483_647).getTimeout()).toBe(2_147_483_647);
  });
});
