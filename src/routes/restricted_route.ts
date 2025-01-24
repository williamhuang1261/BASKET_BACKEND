import express from "express";
import items_routes from './items/items_route.js'


const router = express.Router();
// TODO: Add restricted routes here
router.use('/items', items_routes)

export default router;
