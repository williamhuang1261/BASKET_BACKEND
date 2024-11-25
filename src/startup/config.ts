const config = require('config');

const keyVerif = () => {
  if (!config.get('jwtPrivateKey')){
    throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
  }
}

export default keyVerif;