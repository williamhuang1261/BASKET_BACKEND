import express, { Response } from "express";
import { UserRequest } from "../../interface/UserRequestProps.js";
import {
  valBasketFiltersFilteredStores,
  valBasketFiltersMaxStores,
  valEmail,
  valItemsAdd,
  valItemsRemove,
  valItemsUpdate,
  valLocation,
  valMembership,
  valName,
  valPreferences,
  valSearchPreferencesCategories,
  valSearchPreferencesDistance,
  valSearchPreferencesStores,
} from "../../validation/users/userInfoPutVal.js";
import { categoriesType } from "../../data/data.js";

/**
 * Router for handling user information updates
 * @module UserInfoRouter
 */
const router = express.Router();

/**
 * @route PUT /api/users/me
 * @desc Update authenticated user's information
 * @param {UserRequest} req - Request with user object and update data
 * @param {Response} res - Standard express response object
 * @returns {Promise<void>} - Response with success/failure message
 * @example
 * // Request Body
 * {
 *   "name": string?,
 *   "email": string?,
 *   "location": object?,
 *   "membership": string[]?,
 *   "preferences": {
 *     "weightUnits": string?,
 *     "distUnits": string?,
 *     "language": string?
 *   }?,
 *   "items": {
 *     "add": Array<{id: string, select: boolean}>?,
 *     "remove": string[]?,
 *     "update": Array<{id: string, select: boolean}>?
 *   }?,
 *   "filters": {
 *     "searchPreferences": {
 *       "distance": number?,
 *       "categories": string[]?,
 *       "stores": string[]?
 *     }?,
 *     "basketFilters": {
 *       "filteredStores": string[]?,
 *       "maxStores": number?
 *     }?
 *   }?
 * }
 *
 * // Success Response
 * {
 *   "message": "User updated"
 * }
 *
 * // Error Response
 * {
 *   "message": "Some fields failed validation",
 *   "errors": [{
 *     "message": string,
 *     "failedObject": object
 *   }]
 * }
 */
router.put("/me", async (req: UserRequest, res: Response) => {
  let user = req.user!;
  let errors: {
    message: string;
    failedObject: object;
  }[] = [];

  const { name, email, location, membership, preferences, items, filters } =
    req.body;

  // Validating name
  if (name) {
    const { error } = valName(name);
    if (error)
      errors.push({
        message: error.details[0].message,
        failedObject: { name },
      });
    else user.name = name;
  }

  // Validating email
  if (email) {
    const { error } = valEmail(email);
    if (error)
      errors.push({
        message: error.details[0].message,
        failedObject: { email },
      });
    else user.email = email;
  }

  // Validating location
  if (location) {
    const { error } = valLocation(location);
    if (error)
      errors.push({
        message: error.details[0].message,
        failedObject: { location },
      });
    else user.location = location;
  }

  // Validating membership
  if (membership) {
    const { error } = valMembership(membership);
    if (error)
      errors.push({
        message: error.details[0].message,
        failedObject: { membership },
      });
    else {
      user.membership = new Map(
        (membership as string[]).map((mem) => [mem, true])
      );
    }
  }

  // Validating preferences
  if (preferences) {
    const { error } = valPreferences(preferences);
    if (error)
      errors.push({
        message: error.details[0].message,
        failedObject: { preferences },
      });
    else {
      if (preferences.weightUnits)
        user.preferences.weightUnits = preferences.weightUnits;
      if (preferences.distUnits)
        user.preferences.distUnits = preferences.distUnits;
      if (preferences.language)
        user.preferences.language = preferences.language;
    }
  }

  // Validating items
  if (items) {
    const { add, remove, update } = items;

    if (remove) {
      const { error } = valItemsRemove(remove);
      if (error)
        errors.push({
          message: error.details[0].message,
          failedObject: { items: { remove } },
        });
      else {
        for (const item of remove) {
          user.items.delete(item);
        }
      }
    }
    if (update) {
      const { error } = valItemsUpdate(update);
      if (error)
        errors.push({
          message: error.details[0].message,
          failedObject: { items: { update } },
        });
      else {
        for (const item of update) {
          if (user.items.has(item.id)) user.items.set(item.id, item.select);
        }
      }
    }
    if (add) {
      const { error } = valItemsAdd(add, user.items.size);
      if (error)
        errors.push({
          message: error.details[0].message,
          failedObject: { items: { add } },
        });
      else {
        for (const item of add) {
          if (!user.items.has(item.id)) user.items.set(item.id, item.select);
        }
      }
    }
  }

  // Validating filters
  if (filters) {
    const { searchPreferences, basketFilters } = filters;
    if (searchPreferences) {
      const { distance, categories, stores } = searchPreferences;
      if (distance) {
        const { error } = valSearchPreferencesDistance(distance);
        if (error)
          errors.push({
            message: error.details[0].message,
            failedObject: { filters: { searchPreferences: { distance } } },
          });
        else {
          user.filters.searchPreferences.distance = distance;
        }
      }
      if (categories) {
        const { error } = valSearchPreferencesCategories(categories);
        if (error)
          errors.push({
            message: error.details[0].message,
            failedObject: { filters: { searchPreferences: { categories } } },
          });
        else {
          user.filters.searchPreferences.categories = new Map(
            (categories as categoriesType[]).map((cat) => [cat, true])
          );
        }
      }
      if (stores) {
        const { error } = valSearchPreferencesStores(stores);
        if (error)
          errors.push({
            message: error.details[0].message,
            failedObject: { filters: { searchPreferences: { stores } } },
          });
        else {
          user.filters.searchPreferences.stores = new Map(
            (stores as string[]).map((store) => [store, true])
          );
        }
      }
    }
    if (basketFilters) {
      const { filteredStores, maxStores } = basketFilters;
      if (filteredStores) {
        const { error } = valBasketFiltersFilteredStores(filteredStores);
        if (error)
          errors.push({
            message: error.details[0].message,
            failedObject: { filters: { basketFilters: { filteredStores } } },
          });
        else {
          user.filters.basketFilters.filteredStores = new Map(
            (filteredStores as string[]).map((store) => [store, true])
          );
        }
      }
      if (maxStores) {
        const { error } = valBasketFiltersMaxStores(maxStores);
        if (error)
          errors.push({
            message: error.details[0].message,
            failedObject: { filters: { basketFilters: { maxStores } } },
          });
        else {
          user.filters.basketFilters.maxStores = maxStores;
        }
      }
    }
  }

  // Updating user
  try {
    await user.save();
  } catch (e) {
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }

  // Sending response
  if (errors.length > 0) {
    res.status(400).send({ message: "Some fields failed validation", errors });
    return;
  }
  res.status(200).send({ message: "User updated" });
  return;
});

export default router;
