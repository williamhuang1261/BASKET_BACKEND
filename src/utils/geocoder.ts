import NodeGeocoder from 'node-geocoder';
import config from 'config';

const options = {
  provider: config.get<string>('geocode_provider') as "google",
  apiKey: config.get<string>('geocode_key'),
  formatter: null
};

const geocoder = NodeGeocoder(options);

export default geocoder