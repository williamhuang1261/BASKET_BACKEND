import express from "express";
import items from './restricted/items.js'
import restricted from "../middleware/restricted.js";

const router = express.Router();
// TODO: Add restricted routes handler here
router.use(restricted)
router.use('/items', items)

export default router;
