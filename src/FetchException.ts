/**
 * FetchException
 *
 * Raised by a fetch strategy when a request produced no complete
 * response. The platform's own error is the `cause`. The message names
 * what failed, the method and the URL without its query string, and the
 * cause's message, never a header value or the body.
 *
 * Where this differs from PHPNomad: phpnomad/fetch defines no exception.
 * Its Guzzle strategy throws phpnomad/rest's `RestException`, which would
 * make this package depend on the REST package.
 */
export class FetchException extends Error {
  /**
   * @param message - What failed. The strategy builds it from the rules
   *   above.
   * @param options - `cause`, the platform's own error
   */
  constructor(message: string, options: { cause?: unknown } = {}) {
    super(message, 'cause' in options ? { cause: options.cause } : {});
    this.name = 'FetchException';
  }
}
