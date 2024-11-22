const admin = require("firebase-admin");
const serviceAccount = require("../../config/projectorangetestphase-firebase-adminsdk-c3wa1-f80a214a50.json");

module.exports = function () {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};
