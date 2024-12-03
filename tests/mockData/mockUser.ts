import mongoose from "mongoose";
import UserProps from "../../src/interface/UserProps";
import config from "config";

const mockUser: UserProps = {
  uid: config.get('uid'),
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
  membership: ["Membership1", "Membership2"],
  preferences: {
    weightUnits: "kg",
    distUnits: "km",
    language: "en",
  },
  items: [
    {
      id: new mongoose.Types.ObjectId(),
      select: {
        method: "weight",
        units: "kg",
        quantity: 1,
      },
    },
  ],
  filters: {
    searchFilters: {
      distance: {
        amount: 10,
        units: "km",
      },
      categories: [],
      stores: [],
    },
    basketFilters: {
      filteredStores: [],
      maxStores: null,
    },
  },
};

export default mockUser;