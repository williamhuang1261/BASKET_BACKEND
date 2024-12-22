import express, { Response } from "express";
import { UserRequest } from "../../interface/UserRequestProps.js";
import isLoggedIn from "../../middleware/isLoggedIn.js";
import getAuthFirebase from "../../utils/users/getAuthFirebase.js";
import User from "../../models/users.js";

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
router.post("/oauth", isLoggedIn, async (req: UserRequest, res: Response) => {
  const user = req.user!;
  res.status(200).send({
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
  return
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
  // Validating existence of token
  const idToken = req.header('x-auth-token');
  if (!idToken) {
    res.status(401).send('User is not properly logged in');
    return
  }

  // Validating token
  const decoded = await getAuthFirebase(idToken);
  if (!decoded) {
    res.status(401).send('Tampered/Invalid token');
    return
  }

  // Deleting user
  try {
    await User.deleteOne({uid: decoded.uid});
    res.status(200).send("Deletion successful");
  } catch (e){
    res.status(500).send('Deletion failed');
  }
  return
});

export default router;
