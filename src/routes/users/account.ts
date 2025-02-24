import express, { Response } from "express";
import isLoggedIn from "../../middleware/isLoggedIn.js";
import getAuthFirebase from "../../utils/users/getAuthFirebase.js";
import User from "../../models/users.js";
import { UserRequest } from "../../data/interface/UserRequestProps.js";

const router = express.Router();

/**
 * @route POST /api/users/oauth
 * @desc User signup/login endpoint that returns user data
 * @param {UserRequest} req - Request with user object from OAuth authentication
 * @param {Response} res - Standard express response object
 * @mutates {Response} res - The response object is mutated with user data
 * @example
 * // Response
 * {
 *   "message": "User is logged in",
 *   "user": {
 *     "name": string | null,
 *     "email": string | null,
 *     "location": {
 *       "country": string,
 *       "type": "Point",
 *       "coordinates": [number, number],
 *       "formattedAddress": string
 *     },
 *     "membership": string[],  // Array of membership IDs
 *     "preferences": {
 *       "weightUnits": "kg" | "lbs",
 *       "distUnits": "km" | "mi",
 *       "language": string
 *     },
 *     "items": Array<[string, {
 *       method: "weight" | "unit",
 *       units: string,
 *       quantity: number
 *     }]>
 *     "filters": {
 *       "searchPreferences": {
 *         "distance": {
 *           "amount": number,
 *           "units": string
 *         },
 *         "categories": string[],
 *         "stores": string[]
 *       },
 *       "basketFilters": {
 *         "filteredStores": string[],
 *         "maxStores": number | null
 *       }
 *     }
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
      membership: Array.from(user.membership.keys()),
      preferences: user.preferences,
      items: Array.from(user.items),
      filters: {
        searchPreferences: {
          distance: user.filters.searchPreferences.distance,
          categories: Array.from(
            user.filters.searchPreferences.categories.keys()
          ),
          stores: Array.from(user.filters.searchPreferences.stores.keys()),
        },
        basketFilters: {
          filteredStores: Array.from(
            user.filters.basketFilters.filteredStores.keys()
          ),
          maxStores: user.filters.basketFilters.maxStores,
        },
      },
    },
  });
  return;
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
router.delete("/me", async (req: UserRequest, res: Response) => {
  // Validating existence of token
  const idToken = req.header("x-auth-token");
  if (!idToken) {
    res.status(401).send({ message: "User is not properly logged in" });
    return;
  }

  // Validating token
  const decoded = await getAuthFirebase(idToken);
  if (!decoded) {
    res.status(401).send({ message: "Tampered/Invalid token" });
    return;
  }

  // Deleting user
  try {
    await User.findOneAndDelete({ uid: decoded.uid });
    res.status(200).send({ message: "Deletion successful" });
  } catch (e) {
    res.status(500).send({ message: "Deletion failed" });
  }
  return;
});

export default router;
