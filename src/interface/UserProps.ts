import mongoose from "mongoose";
import { weightUnitsType, distanceUnitsType, allUnitsType } from "../data/units";
import categories from "../data/data";

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
  id: mongoose.Types.ObjectId;
  select: {
    method: "weight" | "unit";
    units: AllUnits;
    quantity: number;
  };
}

type Categories = typeof categories extends Set<infer T> ? T : never;
interface SearchFilters {
  distance: {
    amount: number;
    units: DistanceUnit;
  };
  categories: Categories[];
  stores: mongoose.Types.ObjectId[];
}

interface BasketFilters {
  filteredStores: mongoose.Types.ObjectId[];
  maxStores: number | null;
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