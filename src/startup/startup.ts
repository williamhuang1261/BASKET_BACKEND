import keyVerif from "./config.js";
import dbConnection from "./db.js";
import initFirebase from "./initFirebase.js";
import logging from "./logging.js";
import "./initGoogleAi.js";

const startup = async () => {
  logging();
  keyVerif();
  dbConnection();
  await initFirebase();
};

export default startup;
