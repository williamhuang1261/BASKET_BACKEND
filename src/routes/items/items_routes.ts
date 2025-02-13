import express from "express";
import autocomplete from './autocomplete.js'
import search from './search.js'

const router = express.Router();
router.use("/autocomplete", autocomplete);
router.use('/search', search);

export default router;
