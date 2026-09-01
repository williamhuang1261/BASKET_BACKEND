import express, { Request, Response } from "express";
import ExperimentEvent from "../models/experimentEvent.js";
import valEvent from "../validation/events/valEvent.js";

const router = express.Router();

/**
 * Log an A/B test exposure or conversion event
 * @route POST /events
 * @param {Object} req.body - The event to log
 * @param {string} req.body.experimentId - Which experiment this event belongs to
 * @param {'A'|'B'} req.body.variant - Which variant the session was assigned
 * @param {'exposure'|'conversion'} req.body.eventType - What happened
 * @param {string} req.body.sessionId - Anonymous, client-generated session id
 * @example
 * // Request body
 * {
 *   "experimentId": "savings-summary-framing",
 *   "variant": "A",
 *   "eventType": "exposure",
 *   "sessionId": "3f1c2e9a-..."
 * }
 * @returns {Object} 201 - Event logged
 * @returns {Object} 400 - Some fields are invalid
 * @returns {Object} 500 - Logging failed
 */
router.post("/", async (req: Request, res: Response) => {
  const { error } = valEvent(req.body);
  if (error) {
    res
      .status(400)
      .send({
        message: "Some fields are invalid",
        error: error.details[0].message,
      });
    return;
  }

  const { experimentId, variant, eventType, sessionId } = req.body;

  try {
    const event = new ExperimentEvent({
      experimentId,
      variant,
      eventType,
      sessionId,
    });
    await event.save();
    res.status(201).send({ message: "Event logged" });
  } catch {
    res.status(500).send({ message: "Event logging failed." });
    return;
  }
});

export default router;
