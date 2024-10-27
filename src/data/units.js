const weightUnitsType = ["mg", "g", "kg", "oz", "lb"];
const volumeUnitsType = ["mL", "L", "fl oz", "pint", "quart", "gallon"];
const allMeasUnitsType = [weightUnitsType + volumeUnitsType];
const nonMeasUnitsType = ["unit"];
const allUnitsType = [...weightUnitsType, ...volumeUnitsType, ...nonMeasUnitsType];

const distanceUnitsType = ['km' , 'mi']

exports.weightUnitsType = weightUnitsType;
exports.volumeUnitsType = volumeUnitsType;
exports.allMeasUnitsType = allMeasUnitsType;
exports.nonMeasUnitsType = nonMeasUnitsType;
exports.allUnitsType = allUnitsType;
exports.distanceUnitsType = distanceUnitsType;