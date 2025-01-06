import rateLimit from "express-rate-limit";

/**
 * @description Rate limiter middleware
 */
const rateLimiter = rateLimit({
  windowMs: 10000,
  max: 50,
  message: "Rate limt exceeeded",
  statusCode: 429,
});

export default rateLimiter;