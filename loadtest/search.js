/**
 * Load test for /items/search and /items/autocomplete, the two endpoints a
 * user's search-as-you-type interaction actually calls. Run against a real
 * server (see loadtest/README.md for how to stand one up locally against
 * MongoDB Atlas Local) - this never mocks the HTTP layer or the database.
 *
 * Ramps 10 -> 50 -> 100 virtual users, each iteration issuing one
 * autocomplete call (as a user types) followed by one search call (as they
 * submit), against the real 25-item seeded catalog.
 *
 * Usage:
 *   k6 run loadtest/search.js
 *   k6 run -e BASE_URL=https://localhost:3001 loadtest/search.js
 */
import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

const BASE_URL = __ENV.BASE_URL || "https://localhost:3001";

// Real terms drawn from the seeded catalog (assets/items.json), mixing
// short autocomplete-style prefixes with full search queries.
const AUTOCOMPLETE_PREFIXES = ["ban", "mil", "bre", "chi", "yog"];
const SEARCH_QUERIES = ["banana", "milk", "bread", "chicken", "yogurt", "pepper"];

const searchLatency = new Trend("search_duration_ms", true);
const autocompleteLatency = new Trend("autocomplete_duration_ms", true);
const rateLimited = new Rate("rate_limited_responses");

export const options = {
  insecureSkipTLSVerify: true,
  stages: [
    { duration: "20s", target: 10 },
    { duration: "30s", target: 10 },
    { duration: "20s", target: 50 },
    { duration: "30s", target: 50 },
    { duration: "20s", target: 100 },
    { duration: "30s", target: 100 },
    { duration: "15s", target: 0 },
  ],
};

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export default function () {
  const autocompletePayload = JSON.stringify({
    config: { value: randomFrom(AUTOCOMPLETE_PREFIXES), language: "en", count: 5 },
  });
  const autocompleteRes = http.post(`${BASE_URL}/items/autocomplete`, autocompletePayload, {
    headers: { "Content-Type": "application/json" },
  });
  autocompleteLatency.add(autocompleteRes.timings.duration);
  rateLimited.add(autocompleteRes.status === 429);
  check(autocompleteRes, {
    "autocomplete: 200 or 429": (r) => r.status === 200 || r.status === 429,
  });

  const searchPayload = JSON.stringify({
    config: { value: randomFrom(SEARCH_QUERIES), categories: [], language: "en" },
  });
  const searchRes = http.post(`${BASE_URL}/items/search`, searchPayload, {
    headers: { "Content-Type": "application/json" },
  });
  searchLatency.add(searchRes.timings.duration);
  rateLimited.add(searchRes.status === 429);
  check(searchRes, {
    "search: 200 or 429": (r) => r.status === 200 || r.status === 429,
  });

  sleep(1);
}
