/**
 * Compile-only checks, run by `npm run typecheck`. Each @ts-expect-error
 * line must stay an error. Nothing here runs.
 */

import { FetchPayload, FetchPayloadBuilder } from '@tsnomad/fetch';
import type { FetchStrategy } from '@tsnomad/fetch';
import type { Response } from '@tsnomad/http';

declare const strategy: FetchStrategy;
const answer: Promise<Response> = strategy.fetch(new FetchPayload('https://api.example.invalid/', null));

// @ts-expect-error fetch takes a FetchPayload, not a URL
strategy.fetch('https://api.example.invalid/');

// @ts-expect-error the body is a string or null, never an object
new FetchPayload('https://api.example.invalid/', { a: 1 });

// @ts-expect-error a param is a string, a number or a boolean
new FetchPayload('https://api.example.invalid/', null, 'GET', {}, { list: [1, 2] });

// @ts-expect-error a header value is a string
new FetchPayloadBuilder().setHeader('X-Count', 3);

const built: FetchPayload = new FetchPayloadBuilder().setUrl('https://api.example.invalid/').build();

void [answer, built];
