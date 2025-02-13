/**
 * @fileoverview Main application entry point that sets up the Express server with HTTPS support
 * @module index
 */

import express from "express";
import config from "config";
import fs from "fs";
import { Server } from "http";
import https, { ServerOptions } from "https";
import keyVerif from "./startup/config.js";
import dbConnection from "./startup/db.js";
import initFirebase from "./startup/initFirebase.js";
import logging from "./startup/logging.js";
import routes from "./startup/routes.js";

/** Express application instance */
const app = express();

/** Initialize application components */
logging();
keyVerif();
dbConnection();
await initFirebase();
import "./startup/initGoogleAi.js";
routes(app);

/** Server configuration */
const port: string | number = process.env.PORT || 3001;
const host: string = config.get("server_host");

/** HTTPS server options */
const options: ServerOptions = {
  key: fs.readFileSync("./config/SSL_perms/thebasket.test.key"),
  cert: fs.readFileSync("./config/SSL_perms/thebasket.test.crt"),
};

/** Server instance that will be either HTTP or HTTPS based on environment */
let server: https.Server | Server;

if (process.env.NODE_ENV === "test") {
  server = app.listen(port, () => {
    console.log(
      `Running in ${process.env.NODE_ENV} mode. Listening on http://localhost:${port}`
    );
  });
} else if (
  process.env.NODE_ENV === "development" &&
  process.env.NODE_TLS_REJECT_UNAUTHORIZED &&
  process.env.NODE_TLS_REJECT_UNAUTHORIZED === "0"
) {
  server = https.createServer(options, app).listen(port as number, host, () => {
    console.log(
      `Running in ${process.env.NODE_ENV} mode. Listening on https://${host}:${port}`
    );
  });
} else {
  console.error(
    "\x1b[31m",
    `\n---NODE_ENV: ${process.env.NODE_ENV}---\n
    Please set NODE_ENV to "test" or "development"\n
    \n---NODE_TLS_REJECT_UNAUTHORIZED: ${process.env.NODE_TLS_REJECT_UNAUTHORIZED}---\n
    Please set NODE_TLS_REJECT_UNAUTHORIZED to 0 for development mode\n`,
    "\x1b[0m"
  );
  throw new Error("Invalid environment settings");
}

/** Export server instance for testing purposes */
export default server;
