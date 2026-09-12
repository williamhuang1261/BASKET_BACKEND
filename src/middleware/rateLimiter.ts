import rateLimit from "express-rate-limit";

/**
 * @description Rate limiter middleware. Window/max are configurable via env
 * vars, defaulting to the original hardcoded values, so a load test
 * environment can raise the ceiling without touching production's default:
 * a real k6 run at the defaults showed 95% of requests hitting 429 well
 * before search/DB capacity was stressed at all (see loadtest/RESULTS.md).
 */
const windowMs = Number(process.env.BASKET_RATE_LIMIT_WINDOW_MS) || 10000;
const max = Number(process.env.BASKET_RATE_LIMIT_MAX) || 50;

const rateLimiter = rateLimit({
  windowMs,
  max,
  message: "Rate limt exceeeded",
  statusCode: 429,
});

export default rateLimiter;