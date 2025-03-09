const valFirebaseConfig = () => {
  const envErrors = [];
  if (!process.env.BASKET_FIREBASE_TYPE) envErrors.push("TYPE is undefined");
  if (!process.env.BASKET_FIREBASE_PROJECT_ID)
    envErrors.push("PROJECT_ID is undefined");
  if (!process.env.BASKET_FIREBASE_PRIVATE_KEY_ID)
    envErrors.push("PRIVATE_KEY_ID is undefined");
  if (!process.env.BASKET_FIREBASE_PRIVATE_KEY)
    envErrors.push("PRIVATE_KEY is undefined");
  if (!process.env.BASKET_FIREBASE_CLIENT_EMAIL)
    envErrors.push("CLIENT_EMAIL is undefined");
  if (!process.env.BASKET_FIREBASE_CLIENT_ID)
    envErrors.push("CLIENT_ID is undefined");
  if (!process.env.BASKET_FIREBASE_AUTH_URI)
    envErrors.push("AUTH_URI is undefined");
  if (!process.env.BASKET_FIREBASE_TOKEN_URI)
    envErrors.push("TOKEN_URI is undefined");
  if (!process.env.BASKET_FIREBASE_AUTH_PROVIDER_X509_CERT_URL)
    envErrors.push("AUTH_PROVIDER_X509_CERT_URL is undefined");
  if (!process.env.BASKET_FIREBASE_CLIENT_X509_CERT_URL)
    envErrors.push("CLIENT_X509_CERT_URL is undefined");
  if (!process.env.BASKET_FIREBASE_UNIVERSE_DOMAIN)
    envErrors.push("UNIVERSE_DOMAIN is undefined");
  return envErrors;
};

const valGoogleAiConfifg = () => {
  const envErrors = [];
  if (!process.env.BASKET_GOOGLEAI_PROJECT_ID)
    envErrors.push("PROJECT_ID is undefined");
  if (!process.env.BASKET_GOOGLEAI_LOCATION)
    envErrors.push("LOCATION is undefined");
  return envErrors;
};

const valDevEnv = () => {
  const envErrors = [];

  if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED)
    envErrors.push("NODE_TLS_REJECT_UNAUTHORIZED must be 0 for development");
  if (!process.env.BASKET_JWT_PRIVATE_KEY)
    envErrors.push("JWT_PRIVATE_KEY is undefined");
  if (!process.env.BASKET_SERVER_HOST) envErrors.push("SERVER_HOST is undefined");
  if (!process.env.BASKET_DB_CONNECTION_STRING)
    envErrors.push("DB_CONNECTION_STRING is undefined");

  const firebaseErrors = valFirebaseConfig();
  envErrors.push(...firebaseErrors);
  const googleAiErrors = valGoogleAiConfifg();
  envErrors.push(...googleAiErrors);

  if (envErrors.length !== 0) {
    const errString = envErrors.join("\n");
    console.error(
      "\x1b[31m",
      "\nEnvironment validation failed:",
      errString,
      "\n",
      "\x1b[0m"
    );
    throw new Error("Environment validation failed");
  }
};

const valTestEnv = () => {
  const envErrors = [];

  if (
    process.env.BASKET_DB_CONNECTION_STRING !==
    "mongodb://localhost:27017/basket_tests"
  )
    envErrors.push(
      `DB_CONNECTION_STRING is not set to "mongodb://localhost:27017/basket_tests" but to ${process.env.DB_CONNECTION_STRING}`
    );
  if (!process.env.BASKET_JWT_PRIVATE_KEY)
    envErrors.push("JWT_PRIVATE_KEY is undefined");
  if (!process.env.BASKET_USER_JWT_ID) envErrors.push("USER_JWT_ID is undefined");
  if (!process.env.BASKET_UID) envErrors.push("UID is undefined");

  const firebaseErrors = valFirebaseConfig();
  envErrors.push(...firebaseErrors);
  const googleAiErrors = valGoogleAiConfifg();
  envErrors.push(...googleAiErrors);

  if (envErrors.length) {
    const errString = envErrors.join("\n");
    console.error(
      "\x1b[31m",
      "\nTest environment validation failed:",
      errString,
      "\n"
    );
    throw new Error("Test environment validation failed");
  }
};

const valEnv = () => {
  if (!process.env.NODE_ENV) {
    console.error("\x1b[31m", "\nNODE_ENV must be set\n", "\x1b[0m");
    throw new Error("NODE_ENV must be set");
  }
  if (process.env.NODE_ENV === "development") {
    valDevEnv();
  } else if (process.env.NODE_ENV === "test") {
    valTestEnv();
  }
};

export default valEnv;
