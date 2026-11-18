/**
 * FetchPayload
 *
 * PHPNomad's `PHPNomad\Fetch\Models\FetchPayload`: what a fetch strategy
 * sends. It is final by convention, since TypeScript cannot forbid a
 * subclass, and has getters only, so a payload never changes
 * after it is built. `FetchPayloadBuilder` builds one step by step.
 *
 * Where this differs from PHPNomad:
 * - The body is a string or null. PHP takes any value and leaves its
 *   encoding to the strategy. Encoding JSON or a form is the caller's job
 *   here, so every strategy sends the same bytes.
 * - A param value is a string, a number or a boolean, which is what a
 *   query string can carry.
 * - A sixth argument, `timeout`, in milliseconds, or null for the
 *   strategy's own default. PHP's payload has none, and an SDK seam needs
 *   a timeout per request.
 * - The constructor copies `headers` and `params`, and the getters answer
 *   copies, so a caller's later change to its own object never reaches a
 *   payload. PHP arrays are copied on assignment, so PHP gets this for
 *   free.
 */

import type { Method } from '@tsnomad/http';

export type FetchParamValue = string | number | boolean;

/** The longest delay a JavaScript timer honors. A longer one fires at once. */
const MAX_TIMEOUT_MS = 2_147_483_647;

export class FetchPayload {
  private readonly url: string;
  private readonly body: string | null;
  private readonly method: string;
  private readonly headers: Record<string, string>;
  private readonly params: Record<string, FetchParamValue>;
  private readonly timeout: number | null;

  /**
   * @param url - The absolute URL. `params` are added to its query string
   *   when the request is sent, after any query it already has.
   * @param body - The raw body, or null for none
   * @param method - The HTTP method, GET by default
   * @param headers - Header name to value
   * @param params - Query parameter name to value
   * @param timeout - Milliseconds the strategy allows this request, the
   *   body read included, or null for the strategy's default
   * @throws RangeError when `timeout` is not null and not a number above
   *   zero and at most 2147483647, the longest delay a JavaScript timer
   *   honors
   */
  constructor(
    url: string,
    body: string | null,
    method: Method | string = 'GET',
    headers: Readonly<Record<string, string>> = {},
    params: Readonly<Record<string, FetchParamValue>> = {},
    timeout: number | null = null,
  ) {
    if (timeout !== null && !(typeof timeout === 'number' && timeout > 0 && timeout <= MAX_TIMEOUT_MS)) {
      throw new RangeError(`FetchPayload: the timeout must be null or a number of milliseconds above zero and at most ${MAX_TIMEOUT_MS}, got ${String(timeout)}`);
    }
    this.url = url;
    // A no-op for the declared type. It keeps this file building when the
    // compile-only tests widen the body parameter to check they notice.
    this.body = body as string | null;
    this.method = method;
    this.headers = { ...headers };
    this.params = { ...params };
    this.timeout = timeout;
  }

  getUrl(): string {
    return this.url;
  }

  getMethod(): string {
    return this.method;
  }

  /**
   * The header stored under exactly this name, or null. Names are matched
   * as given, as in PHP, because the payload holds what the caller set.
   */
  getHeader(name: string): string | null {
    return Object.hasOwn(this.headers, name) ? this.headers[name] : null;
  }

  /** A copy of every header. */
  getHeaders(): Record<string, string> {
    return { ...this.headers };
  }

  getBody(): string | null {
    return this.body;
  }

  /** The param stored under exactly this name, or null. */
  getParam(name: string): FetchParamValue | null {
    return Object.hasOwn(this.params, name) ? this.params[name] : null;
  }

  /** A copy of every param. */
  getParams(): Record<string, FetchParamValue> {
    return { ...this.params };
  }

  /** The timeout in milliseconds, or null for the strategy's default. */
  getTimeout(): number | null {
    return this.timeout;
  }
}
