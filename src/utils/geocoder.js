const NodeGeocoder = require('node-geocoder');
const config = require('config');

const options = {
  provider: config.get('geocode_provider'),
  apiKey: config.get('geocode_key'),
  formatter: null
};

const geocoder = NodeGeocoder(options);

module.exports = geocoder;