const mongoose = require('mongoose');
const geocoder = require('../utils/geocoder');
const Joi = require('joi');

// TODO This section no longer requires the GoogleAPI on the backend
// Since there is already a handling in the frontend.

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  supplier: mongoose.Schema.Types.ObjectId,
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress:{
      type: String,
    }
  }
});

const Location = mongoose.model('Location', locationSchema);

function valUserLocCreate(location){
  const schema = Joi.object({
    newAddress: Joi.string().required()
  });
  return schema.validate(location);
}

function valLocCreate(location){
  const schema = Joi.object({
    supplierName: Joi.string(),
    adminAddPassword: Joi.string(),
    supplierAddPassword: Joi.string(),
    payload: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      address: Joi.string().required()
    }))
  });
  return schema.validate(location);
}

exports.Location = Location;
exports.valUserLocCreate = valUserLocCreate;
exports.valLocCreate = valLocCreate;