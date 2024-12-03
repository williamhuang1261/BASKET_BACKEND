import express from 'express'
import oauth from './oauth'
import info from './info'
import isLoggedIn from '../../middleware/isLoggedIn'

const router = express.Router()
router.use('/oauth', isLoggedIn, oauth)
router.use('/info', isLoggedIn, info)

export default router