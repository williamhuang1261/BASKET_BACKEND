import express from 'express'
import account from './account'
import info from './info'
import isLoggedIn from '../../middleware/isLoggedIn'

const router = express.Router()
router.use('/account', isLoggedIn, account)
router.use('/info', isLoggedIn, info)

export default router