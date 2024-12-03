import express, { Application } from "express";
import config from "config";
import fs from "fs";
import https, { ServerOptions } from "https";
import keyVerif from "./startup/config";
import dbConnection from "./startup/db";
import initFirebase from "./startup/initFirebase";
import logging from "./startup/logging";
import routes from "./startup/routes";
import { Server } from "http";
import validation from "./startup/validation";

const app: Application = express();

logging();
routes(app);
keyVerif();
dbConnection();
validation();
initFirebase();

const port: string | number = process.env.PORT || 3001;
const host: string = config.get("server_host");

const options: ServerOptions = {
  key: fs.readFileSync("./config/SSL_perms/thebasket.test.key"),
  cert: fs.readFileSync("./config/SSL_perms/thebasket.test.crt"),
};
let server: https.Server | Server;

if (process.env.NODE_ENV == "test") {
  server = app.listen(port, () => {
    console.log(
      `Running in ${process.env.NODE_ENV} mode. Listening on http://localhost:${port}`
    );
  });
} else if (
  process.env.NODE_ENV == "development" &&
  process.env.NODE_TLS_REJECT_UNAUTHORIZED == "0"
) {
  server = https.createServer(options, app).listen(port as number, host, () => {
    console.log(
      `Running in ${process.env.NODE_ENV} mode. Listening on https://${host}:${port}`
    );
  });
} else {
  throw new Error(
    `NODE_ENV is set to ${process.env.NODE_ENV}. Please set it to either "test" or "development"
    and NODE_TLS_REJECT_UNAUTHORIZED is ${process.env.NODE_TLS_REJECT_UNAUTHORIZED} to 0 if you want to run in development mode`
  );
}

export default server;
