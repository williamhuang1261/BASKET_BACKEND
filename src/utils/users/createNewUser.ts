import { DecodedIdToken } from "firebase-admin/auth";
import User from "../../models/users";
import UserProps from "../../interface/UserProps";
import userCreationValidation from "../../validation/users/userCreationVal";

// Creating a new user helper function
const createNewUser = async (decoded: DecodedIdToken) => {
  // Setting the format of the user
  const userPackage: UserProps = {
    uid: decoded.uid,
    name: decoded.name ? decoded.name : undefined,
    email: decoded.email ? decoded.email : undefined,
    location: {
      // TODO Adjust the country with the website's request
      country: "Canada",
    },
    account: {
      isSupplier: false,
      isAdmin: false,
    },
    membership: new Map(),
    preferences: {
      // TODO Adjust according to country
      weightUnits: "kg",
      distUnits: "km",
      language: "en",
    },
    items: new Map(),
    filters: {
      searchPreferences: {
        // Adjust according to country
        distance: {
          amount: 10,
          units: "km",
        },
        categories: new Map(),
        stores: new Map(),
      },
      basketFilters: {
        filteredStores: new Map(),
        // @ts-ignore
        maxStores: null,
      },
    },
  };

  // Verifying the validity of the user
  const { error } = userCreationValidation(userPackage);
  if (error) return null;

  // Creating the new user
  const user = new User(userPackage);

  try {
    await user.save();
    return user;
  } catch (ex) {
    return null;
  }
};

export default createNewUser;
