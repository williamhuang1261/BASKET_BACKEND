import express, {  Response } from "express";
import { UserRequest } from "../../interface/UserRequestProps.js";
import {
  valBasketFiltersFilteredStoresAdd,
  valBasketFiltersFilteredStoresRemove,
  valBasketFiltersMaxStores,
  valEmail,
  valItemsAdd,
  valItemsRemove,
  valItemsUpdate,
  valLocation,
  valMembershipAdd,
  valMembershipRemove,
  valName,
  valPreferences,
  valSearchPreferencesCategoriesAdd,
  valSearchPreferencesCategoriesRemove,
  valSearchPreferencesDistance,
  valSearchPreferencesStoresAdd,
  valSearchPreferencesStoresRemove,
} from "../../validation/users/userInfoPutVal.js";

const router = express.Router();


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
    const { add, remove } = membership;
    if (remove) {
      const { error } = valMembershipRemove(remove);
      if (error)
        errors.push({
          message: error.details[0].message,
          failedObject: { membership: { remove } },
        });
      else {
        for (const mem of remove) {
          user.membership.delete(mem);
        }
      }
    }
    if (add) {
      const { error } = valMembershipAdd(add, user.membership.size);
      if (error)
        errors.push({
          message: error.details[0].message,
          failedObject: { membership: { add } },
        });
      else {
        for (const mem of add) {
          if (!user.membership.has(mem)) user.membership.set(mem, true);
        }
      }
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
        if (categories.remove) {
          const { error } = valSearchPreferencesCategoriesRemove(
            categories.remove
          );
          if (error)
            errors.push({
              message: error.details[0].message,
              failedObject: {
                filters: {
                  searchPreferences: {
                    categories: { remove: categories.remove },
                  },
                },
              },
            });
          else {
            for (const cat of categories.remove) {
              user.filters.searchPreferences.categories.delete(cat);
            }
          }
        }
        if (categories.add) {
          const { error } = valSearchPreferencesCategoriesAdd(
            categories.add,
            categories.size
          );
          if (error)
            errors.push({
              message: error.details[0].message,
              failedObject: {
                filters: {
                  searchPreferences: { categories: { add: categories.add } },
                },
              },
            });
          else {
            for (const cat of categories.add) {
              if (!user.filters.searchPreferences.categories.has(cat))
                user.filters.searchPreferences.categories.set(cat, true);
            }
          }
        }
      }
      if (stores) {
        if (stores.remove) {
          const { error } = valSearchPreferencesStoresRemove(stores.remove);
          if (error)
            errors.push({
              message: error.details[0].message,
              failedObject: {
                filters: {
                  searchPreferences: { stores: { remove: stores.remove } },
                },
              },
            });
          else {
            for (const store of stores.remove) {
              user.filters.searchPreferences.stores.delete(store);
            }
          }
        }
        if (stores.add) {
          const { error } = valSearchPreferencesStoresAdd(
            stores.add,
            stores.size
          );
          if (error)
            errors.push({
              message: error.details[0].message,
              failedObject: {
                filters: { searchPreferences: { stores: { add: stores.add } } },
              },
            });
          else {
            for (const store of stores.add) {
              if (!user.filters.searchPreferences.stores.has(store))
                user.filters.searchPreferences.stores.set(store, true);
            }
          }
        }
      }
    }
    if (basketFilters) {
      const { filteredStores, maxStores } = basketFilters;
      if (filteredStores) {
        if (filteredStores.remove) {
          const { error } = valBasketFiltersFilteredStoresRemove(
            filteredStores.remove
          );
          if (error)
            errors.push({
              message: error.details[0].message,
              failedObject: {
                filters: {
                  basketFilters: {
                    filteredStores: { remove: filteredStores.remove },
                  },
                },
              },
            });
          else {
            for (const store of filteredStores.remove) {
              user.filters.basketFilters.filteredStores.delete(store);
            }
          }
        }
        if (filteredStores.add) {
          const { error } = valBasketFiltersFilteredStoresAdd(
            filteredStores.add,
            filteredStores.size
          );
          if (error)
            errors.push({
              message: error.details[0].message,
              failedObject: {
                filters: {
                  basketFilters: {
                    filteredStores: { add: filteredStores.add },
                  },
                },
              },
            });
          else {
            for (const store of filteredStores.add) {
              if (!user.filters.basketFilters.filteredStores.has(store))
                user.filters.basketFilters.filteredStores.set(store, true);
            }
          }
        }
      }
      if (maxStores) {
        const { error } = valBasketFiltersMaxStores(maxStores);
        if (error)
          errors.push({
            message: error.details[0].message,
            failedObject: { filters: { basketFilters: { maxStores } } },
          });
        else user.filters.basketFilters.maxStores = maxStores;
      }
    }
  }

  // Updating user
  try {
    await user.save();
  } catch (e) {
    res.status(500).send("Internal Server Error");
    return
  }

  // Sending response
  if (errors.length > 0){
    res.status(400).send({ message: "Some fields failed validation", errors });
    return
  }
  res.status(200).send({ message: "User updated" });
  return
});

export default router;
