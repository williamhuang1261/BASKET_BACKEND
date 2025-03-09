/**
 * @fileoverview Main application entry point that sets up the Express server with HTTPS support
 * @module index
 */

import express from "express";
import fs from "fs";
import { Server } from "http";
import https, { ServerOptions } from "https";
import routes from "./startup/routes.js";
import valEnv from "./startup/valEnv.js";
import startup from "./startup/startup.js";

/** Express application instance */
const app = express();

/** Initialize application components */
valEnv();
await startup();
routes(app);

/** Server configuration */
const port: string | number = process.env.PORT || 3001;
const host: string | undefined = process.env.BASKET__SERVER_HOST || undefined

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
} else if (process.env.NODE_ENV === "development") {
  server = https.createServer(options, app).listen(port as number, host, () => {
    console.log(
      `Running in ${process.env.NODE_ENV} mode. Listening on https://${host}:${port}`
    );
  });
} else {
  console.error(
    "\x1b[31m",
    `\n---NODE_ENV: ${process.env.NODE_ENV}---\n
    Please set NODE_ENV to "test" or "development"\n`
  );
  process.exit(1);
}

/** Export server instance for testing purposes */
export default server;
