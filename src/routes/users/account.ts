import express, { Response } from "express";
import { UserRequest } from "../../interface/UserRequestProps";

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
router.post("/oauth", async (req: UserRequest, res: Response) => {
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

/**
 * @route DELETE /api/users/me
 * @desc Delete the authenticated user's account
 * @param {UserRequest} req - Request with authenticated user object
 * @param {Response} res - Standard express response object
 * @returns {Promise<Response>} - Response with success/failure message
 * @example
 * // Success Response
 * {
 *   "message": "Deletion successful"
 *   "status": 200
 * }
 * 
 * // Error Response
 * {
 *   "message": "Deletion failed"
 *   "status": 500
 * }
 */
router.delete('/me', async (req: UserRequest, res: Response) => {
  const user = req.user!;

  // Deleting user
  try {
    await user.deleteOne();
    return res.status(200).send("Deletion successful");
  } catch {
    return res.status(500).send('Deletion failed')
  }
});

export default router;
