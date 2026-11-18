/**
 * The public entry point, imported by package name. Runs now.
 */

import { expect, test } from 'vitest';
import * as fetchPackage from '@tsnomad/fetch';

test('exports the strategy token, the payload, its builder and the exception', () => {
  expect(Object.keys(fetchPackage).sort()).toEqual(['FetchException', 'FetchPayload', 'FetchPayloadBuilder', 'FetchStrategy']);
  expect(fetchPackage.FetchStrategy.name).toBe('FetchStrategy');
});
