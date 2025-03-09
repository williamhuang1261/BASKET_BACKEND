import admin from "firebase-admin";

/**
 * @description Initializes Firebase Admin SDK with service account credentials
 * @example
 * initFirebase();
 */
const initFirebase = async () => {
  const serviceAccount = {
    type: process.env.BASKET_FIREBASE_TYPE as string,
    project_id: process.env.BASKET_FIREBASE_PROJECT_ID as string,
    private_key_id: process.env.BASKET_FIREBASE_PRIVATE_KEY_ID as string,
    private_key: process.env.BASKET_FIREBASE_PRIVATE_KEY as string,
    client_email: process.env.BASKET_FIREBASE_CLIENT_EMAIL as string,
    client_id: process.env.BASKET_FIREBASE_CLIENT_ID as string,
    auth_uri: process.env.BASKET_FIREBASE_AUTH_URI as string,
    token_uri: process.env.BASKET_FIREBASE_TOKEN_URI as string,
    auth_provider_x509_cert_url: process.env
      .BASKET_FIREBASE_AUTH_PROVIDER_X509_CERT_URL as string,
    client_x509_cert_url: process.env
      .BASKET_FIREBASE_CLIENT_X509_CERT_URL as string,
  };
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
};

export default initFirebase;
