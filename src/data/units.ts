type weightUnitsType = "mg" | "g" | "kg" | "oz" | "lb";
type volumeUnitsType = "mL" | "L" | "fl oz" | "pint" | "quart" | "gallon";
type nonMeasUnitsType = "unit";
type allUnitsType = weightUnitsType | volumeUnitsType | nonMeasUnitsType;
type distanceUnitsType = "km" | "mi";

const weightUnits = new Set<weightUnitsType>(["mg", "g", "kg", "oz", "lb"]);
const volumeUnits = new Set<volumeUnitsType>([
  "mL",
  "L",
  "fl oz",
  "pint",
  "quart",
  "gallon",
]);
const nonMeasUnits = new Set<nonMeasUnitsType>(["unit"]);
const allUnits = new Set<allUnitsType>([
  ...weightUnits,
  ...volumeUnits,
  ...nonMeasUnits,
]);
const distanceUnits = new Set<distanceUnitsType>(["km", "mi"]);

export type {
  weightUnitsType,
  volumeUnitsType,
  nonMeasUnitsType,
  allUnitsType,
  distanceUnitsType,
};
export { weightUnits, volumeUnits, nonMeasUnits, allUnits, distanceUnits };
