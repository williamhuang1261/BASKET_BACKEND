import config from 'config'
/**
 * @description Verifies that JWT private key is defined in config
 * @throws {Error} If jwtPrivateKey is not defined in config
 * @example
 * keyVerif();
 */
const keyVerif = () => {
  if (!config.get('jwtPrivateKey')){
    throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
  }
}

export default keyVerif;