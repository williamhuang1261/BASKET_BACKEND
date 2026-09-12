# Load test results: `/items/search` and `/items/autocomplete`

Real k6 runs against a real, locally running server (Express + MongoDB Atlas
Local, the official `mongodb-atlas-local` Docker image, so the app's actual
`$search` aggregation stage runs against a real Atlas Search index, not a
mock). See `README.md`'s "Load testing" section for how to reproduce these
runs yourself.

Both runs use the same script (`loadtest/search.js`), ramping 10 -> 50 -> 100
virtual users, each iteration issuing one autocomplete call and one search
call against the real 25-item seeded catalog.

## Run 1 -- default rate limiter

| VUs (peak) | Total requests | Throughput | Rate-limited (429) | Search p95 | Autocomplete p95 |
| --- | --- | --- | --- | --- | --- |
| 100 | 15,310 | 92.7 req/s | 94.72% (14,502) | 11.35ms* | 18.19ms* |

\* Latency across only the ~5% of requests that got past the limiter at all;
not representative of real search capacity, since almost every request never
reached the search code and was rejected by the rate limiter first.

Full output: [`runs/01-baseline-default-ratelimit.txt`](runs/01-baseline-default-ratelimit.txt)

**Finding:** the global `rateLimiter` middleware (`express-rate-limit`,
`windowMs=10000, max=50`, applied `app.use()`-wide and keyed by IP) caps the
*entire server* at 5 req/s regardless of how many virtual users are hitting
it. Going from 10 to 100 VUs barely moved total throughput, because the
limiter -- not the database, not the search index, not Express itself -- was
the binding constraint the whole time.

## Fix

`src/middleware/rateLimiter.ts` now reads its window and max from
`BASKET_RATE_LIMIT_WINDOW_MS`/`BASKET_RATE_LIMIT_MAX`, defaulting to the
original hardcoded values (10000ms / 50) if unset. Production behavior is
unchanged; a load test (or a future capacity-planning exercise) can now raise
the ceiling to actually measure what the backend itself can do.

## Run 2 -- rate limiter raised (`BASKET_RATE_LIMIT_MAX=5000`)

| VUs (peak) | Total requests | Throughput | Rate-limited (429) | Search p95 | Autocomplete p95 |
| --- | --- | --- | --- | --- | --- |
| 100 | 13,242 | 79.8 req/s | 0.00% (0) | 188.13ms | 9.47ms |

Full output: [`runs/02-configurable-ratelimit.txt`](runs/02-configurable-ratelimit.txt)

With the artificial ceiling removed, every request reached the real code
path. Autocomplete stayed fast (p95 9.47ms) since it's a single indexed
`$search` lookup with `returnStoredSource` avoiding a second round trip to
Mongo. Search is slower (p95 188ms) because `getHybridSearchPipeline`
attempts a Vertex AI embeddings call first (which fails here, since this
environment has no live GoogleAI credentials) before falling back to the
full-text-only pipeline -- that failed network call, not the database query
itself, is most of the added latency. In production, with real embeddings
available, the hybrid path would skip that failed round trip entirely.

## Engineering notes

The most useful thing this load test found wasn't a slow query -- it was that
almost the entire request budget was being spent on a rate limiter that had
nothing to do with the endpoints being tested. That's a common shape for a
first load test on a service that was built without one: the thing capping
throughput often isn't where anyone expected to look. The fix here is
deliberately narrow (make an existing safety limit configurable, not remove
it) so production keeps its default protection against abusive traffic while
a load test environment can see past it to the code that's actually supposed
to be measured.

A follow-up worth doing before trusting these search numbers for real
capacity planning: re-run with live Vertex AI credentials configured, so the
hybrid vector+full-text path runs instead of the fallback, and separately
measure the embeddings call's own latency contribution.
