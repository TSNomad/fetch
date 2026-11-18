# @tsnomad/fetch

The outbound HTTP contract: `FetchStrategy`, the `FetchPayload` it sends,
`FetchPayloadBuilder`, and `FetchException` for a request that got no
complete response.

This is the TypeScript counterpart to PHPNomad's
[fetch](https://github.com/phpnomad/fetch) package.
`@tsnomad/node-integration` ships `NativeFetchStrategy`, over Node's own
`fetch`.

## Install

```bash
npm install @tsnomad/fetch
```

The package ships compiled JavaScript with its type declarations, so
it needs no build step of its own. It needs Node 20.19 or later.
npm installs the TS Nomad packages it depends on with it.

`scripts/consumer-check.sh [<commit>]` installs the package from git at
one commit into a scratch project and imports every export, from Node
and from TypeScript.

## Where it fits

The fetch contracts build on `@tsnomad/http`, whose `Response` a fetch
answers with. `@tsnomad/node-integration` ships `NativeFetchStrategy`,
the implementation on Node's own `fetch`.

## Use

```ts
import { FetchException, FetchPayloadBuilder, FetchStrategy } from '@tsnomad/fetch';

const payload = new FetchPayloadBuilder()
  .setUrl('https://api.example.invalid/orders')
  .setMethod('POST')
  .setHeader('Content-Type', 'application/json')
  .setBody(JSON.stringify({ id: 42 }))
  .setTimeout(5_000)
  .build();

const fetcher = await container.get(FetchStrategy);
try {
  const response = await fetcher.fetch(payload);
  if (response.getStatus() >= 400) { /* the server's own answer */ }
} catch (error) {
  if (error instanceof FetchException) { /* no complete response */ }
}
```

Every strategy keeps these rules:

- Answer every status as a response, 3xx, 4xx and 5xx included, and
  never follow a redirect.
- Reject with `FetchException`, the cause attached, only when there is no
  complete response: a refused connection, a host that does not
  resolve, the timeout, or a connection dropped while the body is read.
  The cause, for example its `code`, tells a lasting failure from a
  passing one.
- Reject an invalid URL, or one with a user name or password, with a
  `TypeError` that holds no part of the URL.
- Apply the payload's timeout, or the strategy's own, to the whole call,
  the body read included.
- Keep header values, the query string and the body out of every error
  message, and out of everything a logger prints of the cause chain. A
  cause that is not a plain error is a copy that keeps each error's
  class, name and code, with the request parts taken out of its message,
  so the code that tells a lasting failure from a passing one survives.
- Send once. Work that must survive a failed send goes through a durable
  task queue, which owns the retry.
- Filter no address. A caller that fetches a URL it did not choose checks
  the host first.

## Where this differs from PHPNomad

- `fetch` returns a promise.
- A strategy never follows a redirect and answers the 3xx response
  itself. PHPNomad's Guzzle and WordPress strategies follow redirects by
  their libraries' defaults. A redirect the caller did not check could
  carry the request's headers to another host.
- PHPNomad's Guzzle strategy throws for a 4xx or 5xx, and its WordPress
  strategy answers a transport failure as a 500 response. These rules
  keep the WordPress strategy's answer for every status and make a
  transport failure a rejection, so it cannot pass for a reply.
  `FetchException` is new.
- `FetchPayload` takes a string or null body, string, number or boolean
  params, and a timeout, which PHP's payload lacks. It refuses a timeout
  that is not a number above zero and at most 2147483647 ms, the longest
  delay a JavaScript timer honors.

## Extracted 2026-11-17

This package moved into its own repository on 2026-11-17, at version
0.1.0, with its tests.

## License

Copyright (C) 2026 TSNomad.

This package is free software, released under the GNU General Public
License, version 3 or any later version (GPL-3.0-or-later). It comes
with no warranty. The full text is in [LICENSE](LICENSE).
