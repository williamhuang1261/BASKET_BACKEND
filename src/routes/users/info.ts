import mongoose from "mongoose";
import express, { Response } from "express";
import { UserRequest } from "../../interface/UserRequestProps";
import userBasicInfoModifVal from "../../validation/users/userBasicInfoModifVal";
import userLocationModifVal from "../../validation/users/userLocationModifVal";
import userPreferencesModifVal from "../../validation/users/userPreferencesModifVal";
import userFiltersPostVal from "../../validation/users/userFiltersPostVal";
import userFiltersDelVal from "../../validation/users/userFiltersDelVal";
import userItemsPostVal from "../../validation/users/userItemsPostVal";
import userItemsDelVal from "../../validation/users/userItemsDelVal";
import userItemsPutVal from "../../validation/users/userItemsPutVal";

const router = express.Router();

/**
 * @route PUT /api/users/basic/me
 * @desc Modify user basic info, i.e name and email
 * @param {UserRequest} req - Request with user object with body of form:
 * {
 *   name?: string,
 *   email?: string
 * }
 * @param {Response} res - Standard express response object
 * @returns {Promise<Response>} - Response object with status and message
 * @example
 * // Response
 * {
 *   "message": "User updated"
 *   "status": 200
 * }
 *
 *
 * @throws {400} - If body is invalid
 * @throws {500} - If error saving user
 */
router.put("/basic/me", async (req: UserRequest, res: Response) => {
  const user = req.user!;

  // Validating body
  const { error } = userBasicInfoModifVal(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Modifying user
  const { name, email } = req.body;
  if (name) user.name = name.trim();
  if (email) user.email = email;

  // Saving to DB
  try {
    await user.save();
  } catch (e) {
    return res.status(500).send("Error saving user");
  }

  // Positive response
  return res.status(200).send("User updated");
});

/**
 * @route PUT /api/users/location/me
 * @desc Modify user location info
 * @param {UserRequest} req - Request with user object with body of form:
 * {
 *   country: string,
 *   type: 'Point',
 *   coordinates: [number, number],
 *   formattedAddress: string
 * }
 * @param {Response} res - Standard express response object
 * @returns {Promise<Response>} - Response object with status and message
 * @example
 *  // Response
 * {
 *   "message": "Location updated"
 *   "status": 200
 * }
 *
 * @throws {400} - If body is invalid
 * @throws {500} - If error saving user
 *
 */
router.put("/location/me", async (req: UserRequest, res: Response) => {
  const user = req.user!;

  // Validating body
  const { error } = userLocationModifVal(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Modifying user
  user.location.country = req.body.country;
  user.location.type = req.body.type;
  user.location.coordinates = req.body.coordinates;
  user.location.formattedAddress = req.body.formattedAddress;

  // Saving to DB
  try {
    await user.save();
  } catch (e) {
    return res.status(500).send("Error saving user");
  }

  // Positive response
  return res.status(200).send("Location updated");
});

/**
 * @route POST /api/users/membership/me
 * @desc Add memberships to user's membership list
 * @param {UserRequest} req - Request with user object with body of form:
 * {
 *   membership: string[]  // Array of membership IDs
 * }
 * @param {Response} res - Standard express response object
 * @returns {Promise<Response>} - Response object with status and message
 * @example
 * // Response
 * {
 *   "message": "Membership updated"
 *   "status": 200
 * }
 *
 * @throws {400} - If body is invalid or membership array contains invalid IDs
 * @throws {500} - If error saving user
 */
router.post("/membership/me", async (req: UserRequest, res: Response) => {
  const user = req.user!;
  const { membership } = req.body;

  // Validating body
  if (!membership || !Array.isArray(membership))
    return res.status(400).send("Membership is required");
  for (const mem of membership) {
    if (!mongoose.Types.ObjectId.isValid(mem))
      return res.status(400).send("Membership must be an array of strings");
  }

  // Modifying user -- Using set to avoid duplicates
  for (const mem of membership) {
    if (!user.membership.has(mem))
      user.membership.set(mem, true);
  }

  // Saving to DB
  try {
    await user.save();
  } catch (e) {
    return res.status(500).send("Error saving user");
  }

  // Positive response
  return res.status(200).send("Membership updated");
});

/**
 * @route DELETE /api/users/membership/me
 * @desc Remove memberships from user's membership list
 * @param {UserRequest} req - Request with user object with body of form:
 * {
 *   membership: string[]
 * }
 * @param {Response} res - Standard express response object
 * @returns {Promise<Response>} - Response object with status and message
 * @example
 * // Response
 * {
 *   "message": "Membership updated"
 *   "status": 200
 * }
 *
 * @throws {400} - If body is invalid or membership array contains invalid IDs
 * @throws {500} - If error saving user
 */
router.delete("/membership/me", async (req: UserRequest, res: Response) => {
  const user = req.user!;
  const { membership } = req.body;

  // Validating body
  if (!membership || !Array.isArray(membership))
    return res.status(400).send("Membership is required");
  for (const mem of membership) {
    if (typeof mem !== 'string')
      return res.status(400).send("Membership must be an array of strings");
  }

  // Modifying user
  for (const mem of membership) {
    user.membership.delete(mem);
  }
  
  // Saving to DB
  try {
    await user.save();
  } catch (e) {
    return res.status(500).send("Error saving user");
  }

  // Positive response
  return res.status(200).send("Membership updated");
});

/**
 * @route PUT /api/users/preferences/me
 * @desc Modify user preferences
 * @param {UserRequest} req - Request with user object with body of form:
 * {
 *   weightUnits?: string, (weightUnitsType; units.ts)
 *   distUnits?: string, (distanceUnitsType; units.ts)
 *   language?: string, (allUnitsType; units.ts)
 * }
 * @param {Response} res - Standard express response object
 * @returns {Promise<Response>} - Response object with status and message
 * @example
 * // Response
 * {
 *   "message": "Preferences updated"
 *   "status": 200
 * }
 *
 * @throws {400} - If body is invalid
 * @throws {500} - If error saving user
 */
router.put("/preferences/me", async (req: UserRequest, res: Response) => {
  const user = req.user!;

  // Validating body
  const { error } = userPreferencesModifVal(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Modifying user
  const { weightUnits, distUnits, language } = req.body;
  if (weightUnits) user.preferences.weightUnits = weightUnits;
  if (distUnits) user.preferences.distUnits = distUnits;
  if (language) user.preferences.language = language;

  // Saving to DB
  try {
    await user.save();
  } catch (e) {
    return res.status(500).send("Error saving user");
  }

  // Positive response
  return res.status(200).send("Preferences updated");
});

/**
 * @route POST /api/users/items/me
 * @desc Add items to user's items list
 * @param {UserRequest} req - Request with user object with body of form:
 * {
 *   items: [{
 *     id: string, (mongoose.Types.ObjectId; item's _id)
 *     select: {
 *       method: "weight" | "unit",
 *       units: string, (allUnitsType; units.ts)
 *       quantity: number
 *     }
 *   }]
 * }
 * @param {Response} res - Standard express response object
 * @returns {Promise<Response>} - Response object with status and message
 * @example
 * // Response
 * {
 *   "message": "Items added and updated"
 *   "status": 200
 * }
 *
 * @throws {400} - If body is invalid
 * @throws {500} - If error saving user
 */
router.post("/items/me", async (req: UserRequest, res: Response) => {
  const user = req.user!;

  // Validating body
  const { error } = userItemsPostVal(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Modifying user
  const { items } = req.body;
  for (const item of items) {
    if (!user.items.has(item.id))
      user.items.set(item.id, item.select);
      
  }

  // Saving to DB
  try {
    await user.save();
  } catch (e) {
    return res.status(500).send("Error saving user");
  }

  // Positive response
  return res.status(200).send("Items added and updated");
});

/**
 * @route PUT /api/users/items/me
 * @desc Update existing items in user's items list
 * @param {UserRequest} req - Request with user object with body of form:
 * {
 *   items: {
 *     id: string, (mongoose.Types.ObjectId; item's _id)
 *     select: {
 *       method: "weight" | "unit",
 *       units: string, (allUnitsType; units.ts)
 *       quantity: number
 *     }
 *   }[]
 * }
 * @param {Response} res - Standard express response object
 * @returns {Promise<Response>} - Response object with status and message
 * @example
 * // Response
 * {
 *   "message": "Items updated"
 *   "status": 200
 * }
 *
 * @throws {400} - If body is invalid
 * @throws {500} - If error saving user
 */
router.put("/items/me", async (req: UserRequest, res: Response) => {
  const user = req.user!;

  // Validating body
  const { error } = userItemsPutVal(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Modifying user
  const { items } = req.body;
  for (const item of items) {
    if (user.items.has(item.id))
      user.items.set(item.id, item.select);
  }

  // Saving to DB
  try {
    await user.save();
  } catch (e) {
    return res.status(500).send("Error saving user");
  }

  // Positive response
  return res.status(200).send("Items updated");
});

/**
 * @route DELETE /api/users/items/me
 * @desc Remove items from user's items list
 * @param {UserRequest} req - Request with user object with body of form
 * {
 *   items: string[] (mongoose.Types.ObjectId; item's _id)
 * }
 * @param {Response} res - Standard express response object
 * @returns {Promise<Response>} - Response object with status and message
 * @example
 * // Response
 * {
 *   "message": "Items deleted"
 *   "status": 200
 * }
 *
 * @throws {400} - If body is invalid
 * @throws {500} - If error saving user
 */
router.delete("/items/me", async (req: UserRequest, res: Response) => {
  const user = req.user!;

  // Validating body
  const { error } = userItemsDelVal(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Modifying user
  const { items } = req.body;
  for (const item of items) {
    user.items.delete(item);
  }

  // Saving to DB
  try {
    await user.save();
  } catch (e) {
    return res.status(500).send("Error saving user");
  }

  // Positive response
  return res.status(200).send("Items deleted");
});

/**
 * @route POST /api/users/filters/me
 * @desc Add and update user's search and basket filters
 * @param {UserRequest} req - Request with user object with body of form:
 * {
 *   searchFilters?: {
 *     distance?: {
 *       amount: number,
 *       units: "km" | "mi"
 *     },
 *     categories?: string[], (categories; data.ts)
 *     stores?: string[] (mongoose.Types.ObjectId; store's _id)
 *   },
 *   basketFilters?: {
 *     filteredStores?: string[], (mongoose.Types.ObjectId; store's _id)
 *     maxStores?: number | null
 *   }
 * }
 * @param {Response} res - Standard express response object
 * @returns {Promise<Response>} - Response object with status and message
 * @example
 * // Response
 * {
 *   "message": "Filters added and updated"
 *   "status": 200
 * }
 *
 * @throws {400} - If body is invalid
 * @throws {500} - If error saving user
 */
router.post("/filters/me", async (req: UserRequest, res: Response) => {
  const user = req.user!;

  // Validating body
  const { error } = userFiltersPostVal(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Modifying user
  const { searchFilters, basketFilters } = req.body;
  // Adjusting search filters
  if (searchFilters) {
    const { distance, categories, stores } = searchFilters;
    // Adjusting preferred distance filters
    if (distance) {
      if (distance.amount)
        user.filters.searchFilters.distance.amount = distance.amount;
      if (distance.units)
        user.filters.searchFilters.distance.units = distance.units;
    }
    // Adjusting preferred categories
    if (categories) {
      for (const cat of categories) {
        if (!user.filters.searchFilters.categories.has(cat))
          user.filters.searchFilters.categories.set(cat, true);
      }
    }
    // Adjusting preferred stores
    if (stores) {
      for (const store of stores) {
        if (!user.filters.searchFilters.stores.has(store))
          user.filters.searchFilters.stores.set(store, true);
      }
    }
  }
  // Adjusting basket filters
  if (basketFilters) {
    const { filteredStores, maxStores } = basketFilters;
    // Adjusting filtered stores
    if (filteredStores) {
      for (const store of filteredStores) {
        if (!user.filters.basketFilters.filteredStores.has(store))
          user.filters.basketFilters.filteredStores.set(store, true);
      }
    }
    // Adjusting max stores
    if (maxStores) user.filters.basketFilters.maxStores = maxStores;
  }

  // Saving to DB
  try {
    await user.save();
  } catch (e) {
    return res.status(500).send("Error saving user");
  }

  // Positive response
  return res.status(200).send("Filters added and updated");
});

/**
 * @route DELETE /api/users/filters/me
 * @desc Remove filters from user's filter lists
 * @param {UserRequest} req - Request with user object with body of form:
 * {
 *   categories?: string[],
 *   stores?: string[],
 *   filteredStores?: string[],
 *   maxStores?: number | null
 * }
 * @param {Response} res - Standard express response object
 * @returns {Promise<Response>} - Response object with status and message
 * @example
 * // Response
 * {
 *   "message": "Filters deleted"
 *   "status": 200
 * }
 *
 * @throws {400} - If body is invalid
 * @throws {500} - If error saving user
 */
router.delete("/filters/me", async (req: UserRequest, res: Response) => {
  const user = req.user!;

  // Validating body
  const { error } = userFiltersDelVal(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Modifying user
  const { categories, stores, filteredStores, maxStores } = req.body;
  if (categories) {
    for (const cat of categories) {
      user.filters.searchFilters.categories.delete(cat);
    }
  }
  if (stores) {
    for (const store of stores) {
      user.filters.searchFilters.stores.delete(store);
    }
  }
  if (filteredStores) {
    for (const store of filteredStores) {
      user.filters.basketFilters.filteredStores.delete(store);
    }
  }
  if (maxStores) {
    user.filters.basketFilters.maxStores = null;
  }

  // Saving to DB
  try {
    await user.save();
  } catch (e) {
    return res.status(500).send("Error saving user");
  }

  // Positive response
  return res.status(200).send("Filters deleted");
});

export default router;
