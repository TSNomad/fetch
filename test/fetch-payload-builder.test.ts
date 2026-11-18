/**
 * Acceptance tests for FetchPayloadBuilder. They read the built payload
 * through FetchPayload's getters.
 */

import { describe, expect, test } from 'vitest';
import { FetchPayload, FetchPayloadBuilder } from '@tsnomad/fetch';

describe('FetchPayloadBuilder', () => {
  test('builds a payload from every setter, and each setter returns the builder', () => {
    const builder = new FetchPayloadBuilder();
    const same = builder
      .setUrl('https://api.example.invalid/orders')
      .setMethod('PUT')
      .setHeader('Accept', 'application/json')
      .setBody('{}')
      .setParam('page', 3)
      .setTimeout(250);
    expect(same).toBe(builder);

    const payload = builder.build();
    expect(payload).toBeInstanceOf(FetchPayload);
    expect(payload.getUrl()).toBe('https://api.example.invalid/orders');
    expect(payload.getMethod()).toBe('PUT');
    expect(payload.getHeaders()).toEqual({ Accept: 'application/json' });
    expect(payload.getBody()).toBe('{}');
    expect(payload.getParams()).toEqual({ page: 3 });
    expect(payload.getTimeout()).toBe(250);
  });

  test("starts from PHPNomad's defaults: an empty URL, GET, nothing else", () => {
    const payload = new FetchPayloadBuilder().build();

    expect(payload.getUrl()).toBe('');
    expect(payload.getMethod()).toBe('GET');
    expect(payload.getHeaders()).toEqual({});
    expect(payload.getBody()).toBeNull();
    expect(payload.getParams()).toEqual({});
    expect(payload.getTimeout()).toBeNull();
  });

  test('setHeader and setParam add one entry, and setHeaders and setParams replace them all', () => {
    const payload = new FetchPayloadBuilder()
      .setHeader('A', '1')
      .setHeaders({ B: '2', C: '3' })
      .setHeader('D', '4')
      .setParam('a', 1)
      .setParams({ b: 2 })
      .setParam('c', 3)
      .build();

    expect(payload.getHeaders()).toEqual({ B: '2', C: '3', D: '4' });
    expect(payload.getParams()).toEqual({ b: 2, c: 3 });
  });

  test('a later setter call replaces an earlier value for the same name', () => {
    const payload = new FetchPayloadBuilder().setHeader('A', '1').setHeader('A', '2').setParam('p', 'x').setParam('p', 'y').build();

    expect(payload.getHeaders()).toEqual({ A: '2' });
    expect(payload.getParams()).toEqual({ p: 'y' });
  });

  test('keeps building after build(), without changing the payloads it already built', () => {
    const headers: Record<string, string> = { A: '1' };
    const builder = new FetchPayloadBuilder().setUrl('https://one.example.invalid/').setHeaders(headers);
    const first = builder.build();
    headers.A = 'changed';
    builder.setUrl('https://two.example.invalid/').setHeader('B', '2');
    const second = builder.build();

    expect(first.getUrl()).toBe('https://one.example.invalid/');
    expect(first.getHeaders()).toEqual({ A: '1' });
    expect(second.getUrl()).toBe('https://two.example.invalid/');
    expect(second.getHeaders()).toEqual({ A: '1', B: '2' });
  });

  test("build() refuses a bad timeout with FetchPayload's RangeError", () => {
    expect(() => new FetchPayloadBuilder().setTimeout(-5).build()).toThrow(RangeError);
    expect(new FetchPayloadBuilder().setTimeout(10).setTimeout(null).build().getTimeout()).toBeNull();
  });
});
