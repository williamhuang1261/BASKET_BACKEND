const weightUnitsType = new Set(["mg", "g", "kg", "oz", "lb"]);
const volumeUnitsType = new Set(["mL", "L", "fl oz", "pint", "quart", "gallon"]);
const nonMeasUnitsType = new Set(["unit"]);
const allUnitsType = new Set([...weightUnitsType, ...volumeUnitsType, ...nonMeasUnitsType]);
const distanceUnitsType = new Set(['km', 'mi']);

export { weightUnitsType, volumeUnitsType, nonMeasUnitsType, allUnitsType, distanceUnitsType };