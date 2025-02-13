import admin from "firebase-admin";
import serviceAccount from "../../config/projectorangetestphase-firebase-adminsdk-c3wa1-f80a214a50.json" with {type: 'json'};

/**
 * @description Initializes Firebase Admin SDK with service account credentials
 * @example
 * initFirebase();
 */
const initFirebase = async () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
};

export default initFirebase;

