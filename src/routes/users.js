const isLoggedIn = require('../middleware/isLoggedIn');
const isSupplier = require('../middleware/isSupplier')
const isAdmin = require('../middleware/isAdmin');
const {checkAuthPassword} = require('../utils/modifAuth');
const geocoder = require('../utils/geocoder');
const {sendEmail} = require('../utils/email');
const {User, valUserCreation, valUserModif, validateUserUpdateByAdmin,
  valAuthModify, valAuthCreate, valAuthDel} = require('../models/users');
const {Item} = require('../models/items');
const {Location, valUserLocCreate} = require('../models/locations');
const { Supplier } = require('../models/suppliers');
const _ = require('lodash');
const config = require('config');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const accepts = require('accepts');
const express = require('express');
const router = express.Router();

// TODO Handle all new informations that were added to users
// MAJORTODO Change auth to OAUTH2

//Should redirect
router.post('/', async (req, res) => {
  //Testing if client is not already logged in
  const currentToken = req.header('x-auth-token');
  if(currentToken)
    return res.status(400).send('User is already logged in');
  
  //Testing requirements
  const {error} = valUserCreation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Testing unique of email
  let user = await User.findOne({ email: req.body.email });
  if(user) return res.status(400).send('User already registered.');

  //Getting user language
  let language = accepts(req).languages();
  if(language !== 'en' || language !== 'fr') language = 'en';

  //Creating user and hashing password
  const salt = await bcrypt.genSalt(10);
  const confSalt = await bcrypt.genSalt(5);
  const confCode = Math.floor(Math.random()*900000 + 100000).toString();
  const confExp = Date.now() + 600000;
  user = new User(_.pick(req.body, ['name', 'email', 'password']));
  user.preferences.language = language;
  user.password = await bcrypt.hash(user.password, salt);
  user.account.confCode = await bcrypt.hash(confCode, confSalt);
  user.account.confExp = confExp;
  await user.save();

  //Sending email with confirmation code
  const html = `Your confirmation code is ${confCode}. 
    This code will expire in 10 minutes`;
  const email = await sendEmail(req.body.email, 'Confirmation code', html);
  if(!email) return res.status(400).send('Email cannot be reached');

  return res.status(201).send('Account created and awaiting confirmation');
});

router.get('/', isLoggedIn, isAdmin, async (req, res) => {
  //Testing if admin has good password
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password');
  
  //Testing if blocked data is requested
  if(req.body.filters.match('password', 'meta')){
    //Log attempt
    return res.status(400).send('Data cannot be given');
  }

  //Sending requested user data
  const users = await User.find().select(req.body.filters);
  res.status(200).send(users);
});

router.put('/me', isLoggedIn, async(req, res) => {
  const user = req.user
  
  //Testing validity of body info
  const {error} = valUserModif(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Modifying name
  if (req.body.name) user.name = req.body.name

  //Modifying email
  if (req.body.email){
    let existingUser =  await User.findOne({ email: req.body.email });
    if(existingUser) return res.status(400).send('Email already registered');
    user.email = req.body.email;
  }

  //Modifying password
  if (req.body.password){
    const validPassword = await bcrypt
      .compare(req.body.oldPassword, user.password);
    if (!validPassword)
      return res.status(401).send('Invalid original password');

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }

  //Saving and sending
  await user.save();
  res.send(_.pick(user, ['name', 'email']))
});

router.put('/:id', isLoggedIn, isAdmin, async(req, res) => {
  //Validating req.body
  const {error} = validateUserUpdateByAdmin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Testing if admin has good password
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password');

  //Testing request
  if(!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send('The user does not exist');

  //Testing existence of user
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send('User not found');

  //Modifying name
  if (req.body.name) user.name = req.body.name

  //Modifying email
  if (req.body.email){
    let existingUser =  await User.findOne({ email: req.body.email });
    if(existingUser) return res.status(400).send('Email already registered');
    user.email = req.body.email;
  }

  //Modifying password
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
  }

  //Giving Supplier / Admin status to an account

  //Saving and sending
  await user.save();
  res.send(_.pick(user, ['_id', 'name', 'email', 'isSupplier', 'isAdmin']));
});

router.delete('/me', isLoggedIn, async(req, res) => {
  //Testing password
  const validPassword = await bcrypt
    .compare(req.body.password, req.user.password);
  if (!validPassword) return res.status(401).send('Invalid password');

  //Deleting user
  await req.user.deleteOne();
  res.status(200).send('Deletion successful');
});

router.delete('/:id', isLoggedIn, isAdmin, async(req, res) => {

  //Testing if admin has good password
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password');

  //Testing request
  if(!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send('The user does not exist');

  //Testing existence of user
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send('User not found');

  //Deleting user
  await user.deleteOne();
  const validation = await User.findById(user._id)
  if (!validation)
    return res.status(200).send('Deletion successful');
  return res.status(500).send('The account could not be deleted');
});

router.get('/items/me', isLoggedIn, async (req, res) => {
  //Creating payload
  const items = req.user.items;
  let errorPayload = {
    message: 'Some items could not be found',
    data: []
  };
  let payload = [];
  let errIndexes = [];
  for (let i = 0; i < items.length; i++){
    const item = await Item.findById(items[i].id);
    if(item) {
      payload.push(item);
    } else{
      errorPayload.data.push(item);
      errIndexes.push(i)
    }
  }
  //Removing data from user's list
  errIndexes.sort((a, b) => b - a);
  for (const index of errIndexes){
    req.user.items.splice(index, 1);
  }
  await req.user.save();

  //Response
  if(errorPayload.data.length > 0){
    if(payload.length === 0)
      return res.status(400).send('No item could be found');
    const error = {
      payload: payload,
      error: errorPayload
    }
    return res.status(213).send(error);
  }
  const resPayload = {payload: payload}
  return res.status(200).send(resPayload);
});

//Have weight, quantity, prefered units, blablala
router.post('/items/me/:id', isLoggedIn, async (req, res) => {
  //Confirming existance of item
  if(!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send('No item was found');
  const item = await Item.findById(req.params.id)
  if(!item) return res.status(404).send('Item does not exist');

  //Ensuring that item is not already present
  for (const userItem of req.user.items) {
    if(userItem.id.toString() === item.id)
      return res.status(400).send('Item is already in user\'s list');
  }

  //Adding item
  req.user.items.push({
    id: item.id,
    ref: item.ref,
    select: {
      method: 'weight',
      units: 'kg',
      quantity: 1
    }
  });
  await req.user.save();

  return res.status(200).send('Item added');

});

router.delete('/items/me/:id', isLoggedIn, async (req, res) => {

  //Finding item in list
  const index = req.user.items.findIndex(item => item.id.toString() === req.params.id)
  if(index === -1) return res.status(400).send('Item is not in user\'s list');

  //Deleting item
  req.user.items.splice(index, 1);
  await req.user.save();
  return res.status(200).send('Deletion successful');
});

router.post('/location/me', isLoggedIn, async (req, res) => {
  //Validating that address is a string
  const {error} = valUserLocCreate(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  //Deleting previous address and setting new address
  const loc = await geocoder.geocode(req.body.newAddress);
  if(loc.length <= 0)
    return res.status(400).send('This location could not be found');
  const user = req.user;
  user.location = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress
  };
  await user.save();
  res.status(201).send('Location was added successfully');
});

router.delete('/location/me', isLoggedIn, async (req, res) => {
  //Deleting previous address
  const user = req.user;
  user.location = undefined;
  await user.save();

  return res.status(200).send('Your location was removed');
});

router.put('/language/me', isLoggedIn, async (req, res) => {
  const user = req.user;

  //Validating language
  const language = req.body.language;
  if(language !== 'en' && language !== 'fr')
    return res.status(400).send('This language is not supported');

  //Changing user language
  user.preferences.language = language;
  await user.save();

  return res.status(200).send('Language was changed successfully');
});

router.put('/authorization/me', isLoggedIn, isSupplier, async (req, res) => {
  //Validating body info
  const {error} = valAuthModify(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  //Check all passwords
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password(s)');

  //Assigning new password
  const user = req.user;
  const body = req.body;
  if(body.newSupplierAddPassword)
    user.meta.supplierAdd = body.newSupplierAddPassword;
  if(body.newSupplierUpdatePassword)
    user.meta.supplierUpdate = body.newSupplierUpdatePassword;
  if(body.newSupplierDeletePassword)
    user.meta.supplierDelete = body.newSupplierDeletePassword;
  if(body.newSupplierGetPassword)
    user.meta.supplierGet = body.newSupplierGetPassword;
  await user.save();

  return res.status(200).send('Password modifications were successful');
});

router.put('/authorization/:id', isLoggedIn, isAdmin, async (req, res) => {
  //Validating body info
  const {error} = valAuthCreate(req.body);
  if(error) return res.status(400).send(error.details[0].message);
  
  //Check all passwords
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password(s)');

  //Testing request
  if(!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send('The user does not exist');

  //Find user
  const user = await User.findById(req.params.id);
  if(!user) return res.status(404).send('User does not exist');

  //Assign supplier status to user
  user.meta = {
    supplier: req.body.supplierName,
    supplierAdd: req.body.supplierAddPassword,
    supplierUpdate: req.body.supplierUpdatePassword,
    supplierDelete: req.body.supplierDeletePassword,
    supplierGet: req.body.supplierGetPassword
  };
  user.account.isSupplier = true;
  await user.save();

  return res.status(200).send(`Supplier status has been given successfully`);
});

router.delete('/authorization/:id', isLoggedIn, isAdmin, async (req, res) => {
  //Validating body info
  const {error} = valAuthDel(req.body);
  if(error) return res.status(400).send(error.details[0].message);
  
  //Check all passwords
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password(s)');

  //Find user
  if(!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send('The user does not exist');
  const user = await User.findById(req.params.id);
  if(!user) return res.status(404).send('User does not exist');

  //Removing supplier status
  user.account.isSupplier = false;
  user.meta.supplier = undefined;
  user.meta.supplierGet = undefined;
  user.meta.supplierAdd = undefined;
  user.meta.supplierUpdate = undefined;
  user.meta.supplierDelete = undefined;
  await user.save();

  //To remove admin status, the database must be directly accessed
  return res.status(200).send(`Supplier status has been removed`);
});

router.post('/membership/me', isLoggedIn, async (req, res) => {
  // Validating request
  if(typeof req.body.membership !== 'string')
    return res.status(400).send('Supplier membership must be a string');

  // Verifying existence of supplier
  const supplier = await Supplier.findOne({name: req.body.membership});
  if(!supplier) return res.status(400).send('Supplier does not exist');

  // Verifying existence of item in user metadata
  const user = req.user;
  const exist = user.membership.indexOf(supplier.name);
  if(!exist)
    return res.status(200).send('Supplier membership was already added');

  // Pushing new user
  user.membership.push(supplier.name);
  await user.save();
  
  return res.status(200).send('Supplier memebership added successfully')
});

router.delete('/membership/me', isLoggedIn, async (req, res) => {
  // Validating request
  if(typeof req.body.membership !== 'string')
    return res.status(400).send('Supplier membership must be a string');

  // Removing membership
  const user = req.user;
  const index = user.membership.indexOf(req.body.membership);
  if(index === -1)
    return res.status(200).send('Supplier membership was already removed');
  user.membership.splice(index, 1);
  await user.save();

  return res.status(200).send('Supplier membership was removed');
});

module.exports = router;