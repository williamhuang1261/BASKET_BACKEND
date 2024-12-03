const admin = require("firebase-admin");
const serviceAccount = require("../../config/projectorangetestphase-firebase-adminsdk-c3wa1-f80a214a50.json");

/**
 * @description Initializes Firebase Admin SDK with service account credentials
 * @example
 * initFirebase();
 */
const initFirebase = () => { 
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default initFirebase