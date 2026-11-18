/**
 * FetchStrategy
 *
 * PHPNomad's `PHPNomad\Fetch\Interfaces\FetchStrategy`: send one outgoing
 * HTTP request and answer its response. Platform integrations implement
 * it. `NativeFetchStrategy` in @tsnomad/node-integration is the one for a
 * plain Node process.
 *
 * Every implementation keeps these rules, so code that calls through this
 * interface behaves the same on any platform:
 *
 * - Send the payload as it is: method, URL with its params, headers,
 *   body. Honor the payload's timeout, which covers the body read.
 * - Never follow a redirect. Answer the 3xx response as it is.
 * - Answer a `Response` for every HTTP status, 4xx and 5xx included.
 *   Deciding what a status means is the caller's job.
 * - Reject with `FetchException` only when no complete response arrived:
 *   DNS failure, refused connection, TLS failure, timeout, or a
 *   connection that dropped while the body was read. Its `cause` is the
 *   platform's own error, and a caller that must tell a lasting failure
 *   from a passing one reads it, for example its `code`.
 * - Reject an invalid URL, or one with a user name or password, with a
 *   `TypeError` that holds no part of the URL, before anything is sent.
 * - Keep header values, the query string and the body out of every error
 *   message, because they may carry a credential. Keep them out of the
 *   `cause` chain too, so a log that prints it carries no credential. A
 *   strategy may copy the cause chain to do this, keeping each error's
 *   class, name and code with the request parts taken out of its message.
 * - Send once. Never resend on its own. Work that must survive a failed
 *   send goes through a durable task queue, which owns the retry.
 * - Reach any host the URL names. A strategy filters no address, so a
 *   caller that fetches a URL it did not choose itself, such as one a
 *   merchant entered, checks the host before it builds the payload.
 *
 * Where this differs from PHPNomad: `fetch` returns a promise. PHPNomad's
 * integrations disagree on failures: its Guzzle strategy throws a
 * `RestException` for a 4xx or 5xx, and its WordPress strategy answers a
 * transport failure as a 500 response. The rules above keep the WordPress
 * strategy's answer for every status, and make a transport failure a
 * rejection, so it cannot pass for a reply from the server.
 */

import { createToken } from '@tsnomad/di-container';
import type { Response } from '@tsnomad/http';
import type { FetchPayload } from './FetchPayload.js';

export interface FetchStrategy {
  /**
   * @throws FetchException, through the returned promise, when no
   *   complete response arrived
   */
  fetch(payload: FetchPayload): Promise<Response>;
}

export const FetchStrategy = createToken<FetchStrategy>('FetchStrategy');
