import {
  weightUnitsType,
  distanceUnitsType,
  allUnitsType,
} from "../data/units.js";
import categories from "../data/data.js";

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

type WeightUnit = typeof weightUnitsType extends Set<infer T> ? T : never;
type DistanceUnit = typeof distanceUnitsType extends Set<infer T> ? T : never;
interface Preferences {
  weightUnits: WeightUnit;
  distUnits: DistanceUnit;
  language: "en" | "fr";
}

type AllUnits = typeof allUnitsType extends Set<infer T> ? T : never;
interface Item {
  method: "weight" | "unit";
  units: AllUnits;
  quantity: number;
}

type Categories = typeof categories extends Set<infer T> ? T : never;
interface SearchPreferences {
  distance: {
    amount: number;
    units: DistanceUnit;
  };
  categories: Map<string, true>;
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
