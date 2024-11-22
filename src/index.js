const express = require("express");
const config = require("config");
const app = express();
const fs = require("fs");
const https = require("https");

require("./startup/logging")();
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/validation")();
require("./startup/initFirebase")();

const port = process.env.PORT || 3001;
const host = config.get("server_host");

const options = {
  key: fs.readFileSync("./config/SSL_perms/thebasket.test.key"),
  cert: fs.readFileSync("./config/SSL_perms/thebasket.test.crt"),
};

if (process.env.NODE_ENV == "test") {
  const server = app.listen(port, () => {
    console.log(
      `Running in ${process.env.NODE_ENV} mode. Listening on http://localhost:${port}`
    );
  });
  module.exports = server;
} else if (
  process.env.NODE_ENV == "development" &&
  process.NODE_TLS_REJECT_UNAUTHORIZED == "0"
) {
  const server = https.createServer(options, app).listen(port, host, () => {
    console.log(
      `Running in ${process.env.NODE_ENV} mode. Listening on https://${host}:${port}`
    );
  });
  module.exports = server;
} else {
  throw new Error(
    `NODE_ENV is set to ${process.env.NODE_ENV}. Please set it to either "test" or "development"
    and NODE_TLS_REJECT_UNAUTHORIZED is ${process.env.NODE_TLS_REJECT_UNAUTHORIZED} to 0 if you want to run in development mode`
  );
}
