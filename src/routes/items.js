const isAdmin = require('../middleware/isAdmin');
const isLoggedIn = require('../middleware/isLoggedIn');
const {checkAuthPassword} = require('../utils/modifAuth');
const {User} = require('../models/users');
const {Item, valItemDelete, valItemCreate,
  valItemModif} = require('../models/items');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/:id', async (req, res) => {
  //Testing the validity of the path
  let item;
  if(mongoose.Types.ObjectId.isValid(req.params.id)){
    item = await Item.findById(req.params.id)
    if(!item) return res.status(404).send('No item was found');
  }
  else if (
    (req.params.id.length === 4 || req.params.id.length === 5 ||
    req.params.id.length === 12 || req.params.id.length === 13) &&
    /^\d+$/.test(req.params.id)
  ) {
    item = await Item.findOne({'ref.code': req.params.id});
    if(!item) return res.status(404).send('No item was found');
  }
  else {
    return res.status(400).send('No item was found')
  }

  return res.status(200).send(item);
});

router.post('/', isLoggedIn, isAdmin, async (req, res) => {
  //Validate body request
  const {error} = valItemCreate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Validate corresponding ref codes/standards
  const {standard, code} = req.body.ref;
  if(standard === 'PLU' && (code.length !== 4 && code.length !== 5))
    return res.status(400).send('PLU codes must be of length 4 or 5');
  if(standard === 'UPC' && code.length !== 12)
    return res.status(400).send('UPC codes must be of length 12');
  if(standard === 'EAN' && code.length !== 13)
    return res.status(400).send('EAN codes must be of length 13');
  
  //Validate corresponding meas/units
  const {meas, units} = req.body.amount;
  if(
    (meas === 'weight' && !['mg', 'g', 'kg', 'oz', 'lb'].includes(units)) ||
    (meas === 'volume' && !['mL', 'L', 'fl oz', 'pint', 'quart', 'gallon']
    .includes(units)) || (meas === 'units' && units !== 'unit')
  ) {
    return res.status(400).send(`${units} is not an unit of ${meas}`)
  }

  //Validating password
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password');

  //Verify that item doesn't already exist
  const existItem = await Item.findOne({'ref.code': code});
  if(existItem) return res.status(400).send('Item already exists');

  //Creating elems
  const item = new Item({
    name: req.body.name,
    ref: req.body.ref,
    amount: req.body.amount,
    description: req.body.description,
    brand: req.body.brand,
    tags: req.body.tags,
    image: req.body.image
  });
  await item.save();
  return res.status(201).send('Item created');
});

router.put('/:id', isLoggedIn, isAdmin, async (req, res) => {
  //Validate body request
  const {error} = valItemModif(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Validating password
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password');

  //Testing the validity of the path
  if(!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send('No item was found');
  const item = await Item.findById(req.params.id);
  if(!item) return res.status(404).send('Item does not exist');

  //Changing elems
  const {name, ref, amount, description, brand, tags, image} = req.body;

  //Changing names
  if (name) { 
    const { fr, en, size } = name;
    if (fr) item.name.fr = fr
    if (en) item.name.en = en
    if (size) item.name.size = size;
  }

  //Changing ref
  if(ref) {
    const {standard, code} = ref;
    const testStandard = standard || item.ref.standard;
    let length;

    if(standard && !code)
      return res.status('Standard cannot be changed withou changing the code');

    if(testStandard === 'PLU') length = [4, 5];
    if(testStandard === 'UPC') length = [12];
    if(testStandard === 'EAN') length = [13];

    if(!length.includes(code.length)) {
      return res.status(400).send(`${testStandard} codes must be of length 
        ${length.join(' or ')}`);
    }

    item.ref.standard = standard;
    item.ref.code = code;
  };

  //Changing amount
  if(amount){
    const {isApprox, meas, units, quantity} = amount;
    if(isApprox) item.amount.isApprox = isApprox;
    if(quantity) item.amount.quantity = quantity
    if(meas && !units) return res.status(400).send(`Cannot change to ${meas} 
      without changing units`);
    if(units){
      const testMeas = meas || item.amount.meas;
      let expectedUnits;
      if(testMeas === 'weight')
        expectedUnits = ['mg', 'g', 'kg', 'oz', 'lb'];
      if (testMeas === 'volume')
        expectedUnits = ['mL', 'L', 'fl oz', 'pint', 'quart', 'gallon'];
      if (testMeas === 'units')
        expectedUnits = ['unit'];
      
      if(!expectedUnits.includes(units))
        return res.status(400).send(`${units} is not a unit of ${testMeas}`);

      item.amount.meas = meas;
      item.amount.units = units;
    }

  }

  //Changing extra
  if(description) item.description = description;
  if(brand) item.brand = brand;
  if(tags) item.tags = tags;
  if(image) item.image = image;

  //Saving item
  await item.save();
  return res.status(200).send('Item updated successfully');
});

router.delete('/:id', isLoggedIn, isAdmin, async (req, res) => {
  //Validate body request
  const {error} = valItemDelete(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Testing the validity of the path
  if(!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send('No item was found');
  const item = await Item.findById(req.params.id)
  if(!item) return res.status(404).send('No item was found');

  //Validating password
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password');

  // Deleting item
  await item.deleteOne();
  const fail = await User.findById(req.params.id);
  if(fail) return res.status(500).send('Deletion failed');

  return res.status(200).send('Deletion successful');
});

module.exports = router;