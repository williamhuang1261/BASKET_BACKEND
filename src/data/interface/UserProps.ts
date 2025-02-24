import type { categoriesType } from "../categories.js";
import type { weightUnitsType, distanceUnitsType, allUnitsType } from "../units.js";

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
  supplier: string;
  supplierAdd: string;
  supplierUpdate: string;
  supplierGet: string;
  supplierDelete: string;
}

interface AdminInfo {
  adminAdd: string;
  adminUpdate: string;
  adminGet: string;
  adminDelete: string;
}

interface Preferences {
  weightUnits: weightUnitsType;
  distUnits: distanceUnitsType;
  language: "en" | "fr";
}

interface Item {
  method: "weight" | "unit";
  units: allUnitsType;
  quantity: number;
}
interface SearchPreferences {
  distance: {
    amount: number;
    units: distanceUnitsType;
  };
  categories: Map<categoriesType, true>;
  stores: Map<string, true>;
}

interface BasketFilters {
  filteredStores: Map<string, true>;
  maxStores: number | null;
}

interface Filters {
  searchPreferences: SearchPreferences;
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
  membership: Map<string, true>;
  preferences: Preferences;
  items: Map<string, Item>;
  filters: Filters;
}

export default UserProps;
