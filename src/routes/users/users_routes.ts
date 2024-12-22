import express from "express";
import account from "./account.js";
import info from "./info.js";
import isLoggedIn from "../../middleware/isLoggedIn.js";

const router = express.Router();
router.use("/account", account);
router.use("/info", isLoggedIn, info);

export default router;
