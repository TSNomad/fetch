/**
 * FetchPayloadBuilder
 *
 * PHPNomad's `PHPNomad\Fetch\Models\FetchPayloadBuilder`. Each setter
 * returns the builder. `build()` answers a new `FetchPayload` from what
 * was set, and the builder can go on to build others, since a payload
 * keeps its own copies.
 *
 * Defaults, as in PHP: an empty URL, GET, no headers, a null body, no
 * params. Where this differs from PHPNomad: `setTimeout`, for the
 * payload's sixth argument, defaulting to null.
 */

import type { Method } from '@tsnomad/http';
import { FetchPayload } from './FetchPayload.js';
import type { FetchParamValue } from './FetchPayload.js';

export class FetchPayloadBuilder {
  private url = '';
  private method: string = 'GET';
  private headers: Record<string, string> = {};
  private body: string | null = null;
  private params: Record<string, FetchParamValue> = {};
  private timeout: number | null = null;

  setUrl(url: string): this {
    this.url = url;
    return this;
  }

  setMethod(method: Method | string): this {
    this.method = method;
    return this;
  }

  /** Sets one header, keeping the others. */
  setHeader(name: string, value: string): this {
    // The cast is a no-op for the declared type. It keeps this file
    // building when the compile-only tests widen the value to check they
    // notice.
    this.headers[name] = value as string;
    return this;
  }

  /** Replaces every header with a copy of `headers`. */
  setHeaders(headers: Readonly<Record<string, string>>): this {
    this.headers = { ...headers };
    return this;
  }

  setBody(body: string | null): this {
    this.body = body;
    return this;
  }

  /** Sets one param, keeping the others. */
  setParam(name: string, value: FetchParamValue): this {
    this.params[name] = value;
    return this;
  }

  /** Replaces every param with a copy of `params`. */
  setParams(params: Readonly<Record<string, FetchParamValue>>): this {
    this.params = { ...params };
    return this;
  }

  /** The payload's timeout in milliseconds, or null for the default. */
  setTimeout(timeout: number | null): this {
    this.timeout = timeout;
    return this;
  }

  /**
   * @throws RangeError from `FetchPayload` when the timeout is not null and
   *   not a number above zero and at most 2147483647
   */
  build(): FetchPayload {
    // FetchPayload copies the headers and params, so later setter calls
    // never reach a payload already built.
    return new FetchPayload(this.url, this.body, this.method, this.headers, this.params, this.timeout);
  }
}
