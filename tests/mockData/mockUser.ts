import mongoose from "mongoose";
import UserProps from "../../src/data/interface/UserProps";

const mockUser: UserProps = {
  uid: process.env.BASKET_USER_JWT_ID || "",
  name: "John Doe",
  email: "john.doe@example.com",
  location: {
    country: "Canada",
    type: "Point",
    coordinates: [-79.3832, 43.6532],
    formattedAddress: "Toronto, ON, Canada",
  },
  account: {
    isSupplier: false,
    isAdmin: false,
  },
  membership: new Map([["Membership1", true], ["Membership2", true]]),
  preferences: {
    weightUnits: "kg",
    distUnits: "km",
    language: "en",
  },
  items: new Map([
    [
      new mongoose.Types.ObjectId().toString(),
      {
        method: "weight",
        units: "kg",
        quantity: 1,
      },
    ],
  ]),
  filters: {
    searchPreferences: {
      distance: {
        amount: 10,
        units: "km",
      },
      categories: new Map(),
      stores: new Map(),
    },
    basketFilters: {
      filteredStores: new Map(),
      maxStores: null,
    },
  },
};

export default mockUser;
