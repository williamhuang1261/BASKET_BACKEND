const {sendEmail} = require('../utils/email');
const {User, valUserLogging} = require('../models/users');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();

// MAJORTODO Change to OAuth2.0

router.post('/', async (req, res) => {
  //Testing if already logged in
  const currentToken = req.header('x-auth-token');
  if (currentToken) return res.status(400).send('User is already connected');
  
  //Testing validity of body info
  const {error} = valUserLogging(req.body);
  if (error) return res.status(400).send(error.details[0].message)

  //Testing valid email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(401).send('Invalid email or password');

  //Testing valid password
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(401).send('Invalid email or password');

  //If registration not confirmed, send email
  if(!user.account.isConfirmed || user.account.isAdmin || user.account.isSupplier){
    const confSalt = await bcrypt.genSalt(5);
    const confCode = Math.floor(Math.random()*900000 + 100000).toString();
    const confExp = Date.now() + 600000; //10 min timer on the code
    user.account.confCode = await bcrypt.hash(confCode, confSalt);
    user.account.confExp = confExp;
    await user.save();

    const html = `Your confirmation code is ${confCode}. 
      This code will expire in 10 minutes`;
    const email = await sendEmail(req.body.email, 'Confirmation code', html);
    if(!email) return res.status(400).send('Email cannot be reached');

    return res.status(200).send(`Please verify your account`)
  }

  //Generating token
  const token = user.generateAuthToken();
  res.status(200).header('x-auth-token', token).send(_.pick(user, 
    ['name', 'email']));
});

export default router