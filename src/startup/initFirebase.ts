import admin, {ServiceAccount} from "firebase-admin";
import serviceAccount from "../../config/projectorangetestphase-firebase-adminsdk-c3wa1-f80a214a50.json";

/**
 * @description Initializes Firebase Admin SDK with service account credentials
 * @example
 * initFirebase();
 */

const serviceAccountTyped = serviceAccount as ServiceAccount;

const initFirebase = () => { 
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountTyped),
  });
}

export default initFirebase