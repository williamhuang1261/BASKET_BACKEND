# Basket — API

Grocery prices differ enough between nearby stores that the cheapest way to buy a
basket is rarely to buy all of it in one place. Basket takes a shopping list, the
stores near you, and how many of them you are willing to visit, and works out
where to buy what.

This is the Express API: the catalogue, bilingual search, and authentication.
The React client lives in
**[BASKET_FRONTEND](https://github.com/williamhuang1261/BASKET_FRONTEND)**, which
also documents [the store-selection
solvers](https://github.com/williamhuang1261/BASKET_FRONTEND#the-interesting-part-choosing-which-stores-to-visit)
— the algorithmic core of the project.

- **Stack** — Node, Express 4, TypeScript 5, MongoDB Atlas (Mongoose), Firebase Admin, Vertex AI
- **Tests** — Vitest; 125 unit tests run with no credentials, integration tests need a local Mongo
- **Data** — every product carries English and French names and descriptions

---

## Architecture

```mermaid
flowchart LR
    C[React client] -->|HTTPS| RL[rate limiter]
    RL --> R{routes}
    R -->|/items| S[hybrid search]
    R -->|/users| A[Firebase token check]
    R -->|/restricted| G[role guard]
    S -->|query text| V[Vertex AI<br/>multilingual embeddings]
    V -.->|on failure| F[full-text only]
    S --> M[(MongoDB Atlas<br/>vector + full-text indexes)]
    A --> M
    G --> M
```

| Path | Purpose | Guard |
| --- | --- | --- |
| `POST /items/search` | Hybrid product search | rate limit |
| `POST /items/autocomplete` | Prefix suggestions | rate limit |
| `/users/account` | Create and delete accounts | Firebase token |
| `/users/info` | Read and update preferences | `isLoggedIn` |
| `/restricted/items` | Catalogue writes | `isAdmin` / `isSupplier` |

## Search

Grocery search fails in two different ways, so the API runs two retrievers and
merges them.

Someone typing `chocolate chips` wants a lexical match, and full-text search
handles it. Someone typing `something for baking cookies` needs the retrieval to
understand intent, which is what the vector side is for. Because the catalogue is
bilingual, the embeddings come from
`text-multilingual-embedding-002` and the query is tagged with its language
before being embedded, so a French query can still reach an English record.

[`getHybridSearchPipeline.ts`](src/utils/items/getHybridSearchPipeline.ts) builds
a single MongoDB aggregation that runs `$vectorSearch`, `$unionWith` the
full-text stage, groups by document to collapse products found by both, and
fuses the two scores:

```
score = 2·fts² + (2·vs²) / (fts + 9)
```

The squaring rewards a retriever that is confident rather than one that is
merely present in both lists, and the denominator lets the vector score matter
most when the lexical score is weak — which is exactly the intent-style query it
exists to serve. It is hand-tuned rather than derived, and unlike reciprocal
rank fusion it has no published behaviour to lean on. It has not been evaluated
against a labelled relevance set, so treat it as a working heuristic.

**Degradation is deliberate.** Embeddings mean a network call to Vertex AI, and
that call can fail or run slow. When it does,
[`getVectorSearchObject`](src/utils/items/getVectorSearchObject.ts) returns
`null` and the pipeline drops to full-text only rather than failing the request.
Search gets worse; it does not go down.

## Data model

An item is not a product on a shelf — it is a product that several suppliers all
sell, each at their own price, under their own brand, in their own package size.
[`models/items.ts`](src/models/items.ts) keeps a single item document with an
array of supplier offers, keyed by a real barcode standard (`PLU`, `UPC`, `EAN`)
so the same product resolves across chains.

Quantities are stored as a method (`weight`, `volume`, `unit`), a unit, and a
count, with an `isApprox` flag for items sold loose. That is what lets the client
normalise everything to a comparable unit price; a `2 kg` bag and a `4 lb` bag
have to end up on the same axis before any comparison means anything.

## Security

- Firebase ID tokens are verified server-side by `firebase-admin`; the API never
  trusts a client-supplied identity.
- `isLoggedIn` provisions a user record on first authenticated request, so
  sign-up and first sign-in are the same path.
- `isAdmin` and `isSupplier` gate catalogue writes behind `/restricted`.
- Every request passes a rate limiter (50 requests / 10 s) before routing.
- Request bodies are validated with Joi schemas in
  [`src/validation`](src/validation) before reaching a handler.
- All configuration is read from the environment. Nothing sensitive is committed.

## Running it

```bash
npm install
npx vitest run tests/unit   # 125 tests, no credentials or network needed
npm run build
npm run dev
```

`npm test` also runs `tests/integration`, which is a heavier ask: those tests
talk to a real Mongo at `mongodb://localhost:27017/basket_tests` and verify
Firebase tokens against a real project, so they hang rather than fail if neither
is present. Run the unit suite above for a quick check of a fresh clone.

`npm run dev` needs an environment file and will refuse to start without one —
[`src/startup/valEnv.ts`](src/startup/valEnv.ts) lists every variable it checks.
You will need:

| Group | Variables |
| --- | --- |
| Mongo | `BASKET_DB_CONNECTION_STRING` |
| Server | `PORT`, `BASKET_SERVER_HOST`, `NODE_ENV` (`development` or `test`) |
| Auth | `BASKET_JWT_PRIVATE_KEY` |
| Firebase | `BASKET_FIREBASE_*` — the eleven fields of a service-account key |
| Vertex AI | `BASKET_GOOGLEAI_PROJECT_ID`, `BASKET_GOOGLEAI_LOCATION` |
| Development | `NODE_TLS_REJECT_UNAUTHORIZED=0`, for the local self-signed certificate |

Search additionally expects two MongoDB Atlas indexes on the `items` collection:
a vector index named `vector_search_index` over the `embeddings` path, and a
full-text index. Without them the search routes will not return results.

In `development` the server binds HTTPS and reads a local certificate from
`config/SSL_perms/`; `NODE_ENV=test` serves plain HTTP, which is what the
integration tests use.

## Status

A personal project, built and iterated on over about six months. It is not
deployed publicly — running it needs a Mongo cluster, a Firebase project and a
GCP project of your own.
