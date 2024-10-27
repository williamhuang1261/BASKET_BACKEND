const {User} = require('../models/users');
const {sendEmail} = require('../utils/email');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const _ = require('lodash');
const express = require('express');
const router = express.Router();

router.post('/me', async (req, res) => {
  //Testing if already logged in
  const currentToken = req.header('x-auth-token');
  if (currentToken) return res.status(400).send('User is already connected');

  //Testing body
  const schema = Joi.object({
    email: Joi.string().required(),
    code: Joi.string().pattern(/^[0-9]{6}$/).required(),
  });
  const {error} = schema.validate(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  //Testing valid email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(401).send('Invalid email or password');
  
  //Testing valid code
  const validCode = await bcrypt.compare(req.body.code, user.account.confCode);
  if (!validCode) return res.status(401).send('Invalid code');

  //Validating expiration
  if(Date.now() > user.account.confExp){
    const confSalt = await bcrypt.genSalt(5);
    const confCode = Math.floor(Math.random()*900000 + 100000).toString();
    const confExp = Date.now() + 600000;
    user.account.confCode = await bcrypt.hash(confCode, confSalt);
    user.account.confExp = confExp;
    await user.save();

    //Send email
    const html = `Your confirmation code is ${confCode}. 
      This code will expire in 10 minutes`;
    const email = await sendEmail(req.body.email, 'Confirmation code', html);
    if(!email) return res.status(400).send('Email cannot be reached');
    
    return res.status(401).send(`This code has expired. 
      A new one has been sent`);
  }

  //Removing confCode and changing isConfirmed
  user.account.confCode = undefined;
  user.account.isConfirmed = true;
  await user.save();

  //Generating token
  const token = user.generateAuthToken();
  res.status(200).header('x-auth-token', token).send(_.pick(user, 
    ['name', 'email']));
});

module.exports = router;