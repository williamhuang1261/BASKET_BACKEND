import keyVerif from "./config.js";
import dbConnection from "./db.js";
import initFirebase from "./initFirebase.js";
import logging from "./logging.js";
import "./initGoogleAi.js";
import valEnv from "./valEnv.js";

const startup = async () => {
  valEnv();
  logging();
  keyVerif();
  dbConnection();
  await initFirebase();
};

export default startup;
