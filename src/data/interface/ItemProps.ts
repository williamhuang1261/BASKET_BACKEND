import { categoriesType } from "../data/categories.js";
import { allUnitsType } from "../data/units.js";

interface SuppliersProps {
  supplier: string;
  brand: string;
  pricing: {
    typeOfRebate: "buyXgetYatC" | "buyXgetYforC" | "C";
    X?: number;
    Y?: number;
    C: number;
    method: "unit" | "weight_lb" | "weight_kg" | "weight_100g";
    timeframe: {
      start: Date;
      end: Date;
    };
    onlyMembers: boolean;
  };
}

interface ItemProps {
  name: {
    fr?: string;
    en: string;
    size?: "S" | "M" | "L" | "XL";
  };
  ref: {
    standard: "PLU" | "UPC" | "EAN";
    code: string;
  };
  amount: {
    isApprox: boolean;
    method: "weight" | "volume" | "unit";
    units: allUnitsType;
    count: number;
  };
  description?: {
    en: string;
    fr?: string;
  };
  suppliers: SuppliersProps[];
  categories: categoriesType[];
  image: Buffer;
  embeddings: (number | null | undefined)[]
}

export type { ItemProps };
