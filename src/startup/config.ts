/**
 * @description Verifies that JWT private key is defined in config
 * @throws {Error} If jwtPrivateKey is not defined in config
 * @example
 * keyVerif();
 */
const keyVerif = () => {
  if (!process.env.BASKET_JWT_PRIVATE_KEY) {
    throw new Error('FATAL ERROR: jwtPrivateKey is not defined.');
  }
}

export default keyVerif;