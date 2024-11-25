import User from "../models/users.js";

interface Location {
  country: "Canada" | "USA";
  type?: "Point";
  coordinates?: number[];
  formattedAddress?: string;
}

interface Account {
  isSupplier: boolean;
  isAdmin: boolean;
}

interface SupplierInfo {
  supplier?: string;
  supplierAdd?: string;
  supplierUpdate?: string;
  supplierGet?: string;
  supplierDelete?: string;
}

interface AdminInfo {
  adminAdd?: string;
  adminUpdate?: string;
  adminGet?: string;
  adminDelete?: string;
}

interface Preferences {
  weightUnits?: string;
  distUnits?: string;
  language?: "en" | "fr";
}

interface Item {
  id: string; // Assuming mongoose.Schema.Types.ObjectId is represented as string
  ref: {
    standard: "PLU" | "UPC" | "EAN";
    code?: string;
  };
  select: {
    method: "weight" | "unit";
    units?: string; // Assuming allUnitsType is represented as string
    quantity?: number;
  };
}

interface SearchFilters {
  distance: {
    amount?: number;
    units?: string; // Assuming distanceUnitsType is represented as string
  };
  categories: string[];
  stores: string[];
}

interface BasketFilters {
  filteredStores: string[];
  maxStores?: number;
}

interface Filters {
  searchFilters: SearchFilters;
  basketFilters: BasketFilters;
}

interface UserProps {
  uid: string;
  name?: string;
  email?: string;
  location: Location;
  account: Account;
  supplierInfo?: SupplierInfo;
  adminInfo?: AdminInfo;
  membership: string[];
  preferences: Preferences;
  items: Item[];
  filters: Filters;
}

export default UserProps;