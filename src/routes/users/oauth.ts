import express, { Response } from "express";
import { UserRequest } from "../../interface/RequestsProps";

const router = express.Router();

/**
 * @route POST /api/users/oauth
 * @desc User signup/login endpoint that returns user data
 * @param {UserRequest} req - Request with user object from OAuth authentication
 * @param {Response} res - Standard express response object
 * @returns {Promise<Response>} - Response object with user data
 * @example
 * // Response
 * {
 *   "message": "User is logged in",
 *   "user": {
 *     "name": string | null,
 *     "email": string | null,
 *     "location": object,
 *     "membership": string[],
 *     "preferences": object,
 *     "items": array,
 *     "filters": object
 *   }
 * }
 */
router.post("/", async (req: UserRequest, res: Response) => {
  const user = req.user!;
  return res.status(200).send({
    message: "User is logged in",
    user: {
      name: user.name ? user.name : null,
      email: user.email ? user.email : null,
      location: user.location,
      membership: user.membership,
      preferences: user.preferences,
      items: user.items,
      filters: user.filters,
    },
  });
});

export default router;
