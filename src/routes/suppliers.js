const isAdmin = require('../middleware/isAdmin');
const isSupplier = require('../middleware/isSupplier');
const isLoggedIn = require('../middleware/isLoggedIn');
const {checkAuthPassword} = require('../utils/modifAuth');
const geocoder = require('../utils/geocoder');
const {User} = require('../models/users');
const {Supplier, valSupGet, valSupAdd, valSupPut, valSupDel,
  valSupAddItem,valSupPutItem, valSupDelItem,
  valSupDelItemPrice} = require('../models/suppliers');
const { Item } = require('../models/items');
const {Location, valLocCreate} = require('../models/locations');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const winston = require('winston');
const express = require('express');
const router = express.Router();


router.post('/', isLoggedIn, isAdmin, async (req, res) => {
  //Validating body info
  const {error} = valSupAdd(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  //Verifying password
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password');

  //Verifying if supplier name is already used
  const existSupplier = await Supplier.findOne({name: req.body.supplierName});
  if(existSupplier)
    return res.status(400).send('Name is already used by another supplier')

  //Creating Supplier
  const supplier = new Supplier({
    name: req.body.supplierName,
    logo: req.body.logo
  });
  await supplier.save();
  
  return res.status(201).send(supplier);
});

router.put('/me', isLoggedIn, isSupplier, async (req, res) => {
  //Validating body info
  const {error} = valSupPut(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Verifying password
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password');

  //Finding supplier
  let supplier;
  if(req.user.account.isSupplier){
    supplier = await Supplier.findOne({name: req.user.meta.supplier});
    if (!supplier) return res.status(400)
      .send(`The user is not linked to an existing supplier`);
  }
  if(req.user.account.isAdmin){
    supplier = await Supplier.findOne({name: req.body.supplierName});
    if (!supplier) return res.status(400)
      .send(`No existing supplier was provided`);
  }

  //Changing name
  let prevName = supplier.name;
  if(req.body.name){
    const existSupplier = await Supplier.findOne({name: req.body.name});
    if(existSupplier) return res.status(400).send('Name is already used');
    supplier.name = req.body.name;
    
    const otherUsers = await User.find({'meta.supplier': prevName});
    for (const user of otherUsers) {
      user.meta.supplier = req.body.name;
      await user.save();
    }
  }

  //Changing logo
  if(req.body.logo) supplier.logo = req.body.logo;

  //Saving changes
  try {
    await supplier.save();
  }
  catch{
    const prevUsers = await User.find({'meta.supplier': req.body.name});
    try {
      for (const user of prevUsers) {
        user.meta.supplier = prevName;
        await user.save();
      }
    }
    catch {
      return res.status(666).send('Please contact us! Possible corruption!');
    }
    return res.status(500).send('Something failed');
  }
  return res.status(200).send('Update successful');
});

router.delete('/:id', isLoggedIn, isAdmin, async (req, res) => {
  //Validating body info
  const {error} = valSupDel(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Verifying password
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password');

  //Finding supplier
  if(!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send('No supplier was found');
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).send(`No supplier was found`);

  //Deleting supplier
  await supplier.deleteOne();
  return res.status(200).send('Deletion successful');
});

router.get('/items/:id', async (req, res) => {
  //Verify is id is an ObjectId
  if(!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send('No supplier was found');

  //Finding supplier
  const supplier = await Supplier.findById(req.params.id)
  if(!supplier) return res.status(404).send('No supplier was found');

  //Returning supplier
  const body = {
    name: supplier.name,
    items: supplier.items
  }
  return res.status(200).send(body);
});

router.post('/items/me', isLoggedIn, isSupplier, async (req, res) => {
  //Validating body info
  const {error} = valSupAddItem(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Verifying password
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password');

  //Finding for Supplier and Item concurrently
  let item;
  let supplier;
  let supplierPromise;
  if (req.user.amount.isSupplier) 
    supplierPromise = Supplier.findOne({name: req.user.meta.supplier});
  if (req.user.amount.isAdmin)
    supplierPromise = Supplier.findOne({name: req.body.supplierName});
  const itemPromise = Item.findOne({'ref.code': req.body.code });
  await Promise.all([supplierPromise, itemPromise])
    .then(([supplierThen, itemThen]) => {
      supplier = supplierThen;
      item = itemThen;
    });
  if(!supplier && req.user.account.isAdmin)
    return res.status(400).send('No valid supplier was provided');
  if(!supplier && req.user.account.isSupplier)
    return res.status(400).send('No valid supplier is linked to user');
  if(!item)
    return res.status(400).send('No valid item was provided');
  const oldSupplier = supplier;

  //Search for existing sup in item schema
  for (let i = 0; i < item.suppliers.length ; i++) {
    if(item.suppliers[i].supplier === supplier.name) {
      item.suppliers.splice(i, 1);
    }
  }
  //Search for existing item in sup schema
  for (let i = 0; i < supplier.items.length ; i++) {
    if(supplier.items[i].item.code === item.ref.code) {
      supplier.items.splice(i, 1);
    }
  }

  //Create objects
  let addSup = {supplier: supplier.name};
  let addItem = {item: {
    code: item.ref.code,
    id: item.id
  }};

  //Creating price object
  if(req.body.pricing){
    const {normal, method, limited} = req.body.pricing;
    if(limited){
      const {typeOfRebate, X, Y, C, start, end} = limited;

      if(typeOfRebate === 'buyXgetYforC' && (!X || !Y || !C))
        return res.status(400).send(`${typeOfRebate} requires 3 arguments`);
      if(typeOfRebate === 'XforC' && (!X || !C))
        return res.status(400).send(`${typeOfRebate} requires 2 arguments`);
      if(typeOfRebate === 'C' && !C)
        return res.status(400).send(`Limited price must be given`);
      if(start > end)
        return res.status(400).send('Rebate dates are invalid');
    }
    const pricing = {
      normal: normal,
      method: method,
      limited: [limited]
    }
    addSup.pricing = pricing;
    addItem.pricing = pricing;
  }

  //Updating
  item.suppliers.push(addSup);
  supplier.items.push(addItem);
  await supplier.save();
  try{
    await item.save();
  }
  catch (e) {
    const newSupplier = supplier;
    supplier = oldSupplier;
    try{
      await supplier.save();
    }
    catch (e) {
      winston.error(`${item.id} failed to save. ${supplier.id} failed to revert
        to ${newSupplier}`);
      return res.status(666).send('Please contact support! Files corrupted!');
    }
    return res.status('Creation failed');
  }
  return res.status(200).send('OK');
});

router.put('/items/price/me', isLoggedIn, isSupplier, async (req, res) => {
  //Validating body info
  const {error} = valSupPutItem(req.body);
  if (error) return res.status(400).send(error.details[0].message);
 
  //Verifying password
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password');

  //Finding for Supplier and Item concurrently
  let item;
  let supplier;
  let supplierPromise;
  if (req.user.account.isSupplier) 
    supplierPromise = Supplier.findOne({name: req.user.meta.supplier});
  if (req.user.account.isAdmin)
    supplierPromise = Supplier.findOne({name: req.body.supplierName});
  const itemPromise = Item.findOne({'ref.code': req.body.code });
  await Promise.all([supplierPromise, itemPromise])
    .then(([supplierThen, itemThen]) => {
      supplier = supplierThen;
      item = itemThen;
    });
  if(!supplier && req.user.account.isAdmin)
    return res.status(400).send('No valid supplier was provided');
  if(!supplier && req.user.account.isSupplier)
    return res.status(400).send('No valid supplier is linked to user');
  if(!item)
    return res.status(400).send('No valid item was provided');

  //Verif if item is in supplier schema
  let itemIndex = -1;
  for (let i = 0; i < supplier.items.length; i++) {
    if(supplier.items[i].item.code === item.ref.code){
      itemIndex = i;
      break;
    } else{
      continue;
    }
  }

  //Verif if supplier is in item schema
  let supplierIndex = -1;
  for (let i = 0; i < item.suppliers.length; i++) {
    if (item.suppliers[i].supplier === supplier.name){
      supplierIndex = i;
      break;
    } else {
      continue;
    }
  }

  //Verifying combinations
  const {normal, method, limited} = req.body.pricing;
  if(limited){
    const {typeOfRebate, X, Y, C, start, end} = limited;

    if(!typeOfRebate)
      return res.status(400).send('A type of rebate must be provided');
    if(typeOfRebate === 'buyXgetYforC' && (!X || !Y || !C))
      return res.status(400).send(`${typeOfRebate} requires 3 arguments`);
    if(typeOfRebate === 'XforC' && (!X || !C))
      return res.status(400).send(`${typeOfRebate} requires 2 arguments`);
    if(typeOfRebate === 'C')
      return res.status(400).send(`Limited price must be given`);

    if(!start)
      return res.status(400).send('Start date for rebate is required');
    if(!end)
      return res.status(400).send('End date for rebate is required');
    if(start > end)
      return res.status(400).send('Rebate dates are invalid');
  }

  //Creating objects and assigning to schema
  if(itemIndex !== -1){ //If item was found in item schema
    if (normal) supplier.items[itemIndex].pricing.normal = normal;
    if (method) supplier.items[itemIndex].pricing.method = method;
    if (limited) supplier.items[itemIndex].pricing.limited.push(limited);
  } 
  else { //If item wasn't found in supplier schema
    if (!normal || !method)
      return res.status(400).send('All normal price data must be provided');
    let pricing;
    pricing = {
      normal: normal,
      method: method,
    }
    if(limited) pricing.limited = [limited];
    supplier.items.push({
      item: {
        code: item.ref.code,
        id: item.id
      },
      pricing: pricing
    });
  }
  if(supplierIndex !== -1){ //If supplier existed in item schema
    if (normal) item.suppliers[supplierIndex].pricing.normal = normal;
    if (method) item.suppliers[supplierIndex].pricing.method = method;
    if (limited) item.suppliers[supplierIndex].pricing.limited.push(limited);
  } 
  else { //If supplier wasn't found in item schema
    let pricing;
    if (!normal || !method)
      return res.status(400).send('All normal price data must be provided');
    pricing = {
      normal: normal,
      method: method,
    }
    if(limited) pricing.limited = [limited];
    item.suppliers.push({
      item: {
        code: item.ref.code,
        id: item.id
      },
      pricing: pricing
    })
  }
  
  //Saving item and supplier
  await item.save();
  await supplier.save();
  return res.status(200).send('Price update successful');
});

router.delete('/items/me', isLoggedIn, isSupplier, async (req, res) => {
  //Validating body info
  const {error} = valSupDelItem(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  
  //Verifying password
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password');

  //Finding for Supplier and Item concurrently
  let item;
  let supplier;
  let supplierPromise;
  if (req.user.account.isSupplier) 
    supplierPromise = Supplier.findOne({name: req.user.meta.supplier});
  if (req.user.account.isAdmin)
    supplierPromise = Supplier.findOne({name: req.body.supplierName});
  const itemPromise = Item.findOne({'ref.code': req.body.code });
  await Promise.all([supplierPromise, itemPromise])
    .then(([supplierThen, itemThen]) => {
      supplier = supplierThen;
      item = itemThen;
    });
  if(!supplier && req.user.account.isAdmin)
    return res.status(400).send('No valid supplier was provided');
  if(!supplier && req.user.account.isSupplier)
    return res.status(400).send('No valid supplier is linked to user');
  if(!item)
    return res.status(400).send('No valid item was provided');

  //Finding item and supplier in array + deleting
  for (let i = 0; i < supplier.items.length; i++) {
    if(supplier.items[i].item.code === item.ref.code){
      supplier.items.splice(i, 1);
      break;
    } else{
      continue;
    }
  }
  for (let i = 0; i < item.suppliers.length; i++) {
    if (item.suppliers[i].supplier === supplier.name){
      item.suppliers.splice(i, 1);
      break;
    } else {
      continue;
    }
  }

  await item.save();
  await supplier.save();
  return res.status(200).send('The item was removed from your list');
});

router.delete('/items/price/me', isLoggedIn, isSupplier, async (req, res) => {
  //Validating body info
  const {error} = valSupDelItemPrice(req.body);
  if (error) return res.status(400).send(error.details[0].message);
 
  //Verifying password
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password');

  //Finding for Supplier and Item concurrently
  let item;
  let supplier;
  let supplierPromise;
  if (req.user.account.isSupplier) 
    supplierPromise = Supplier.findOne({name: req.user.meta.supplier});
  if (req.user.account.isAdmin)
    supplierPromise = Supplier.findOne({name: req.body.supplierName});
  const itemPromise = Item.findOne({'ref.code': req.body.code });
  await Promise.all([supplierPromise, itemPromise])
    .then(([supplierThen, itemThen]) => {
      supplier = supplierThen;
      item = itemThen;
    });
  if(!supplier && req.user.account.isAdmin)
    return res.status(400).send('No valid supplier was provided');
  if(!supplier && req.user.account.isSupplier)
    return res.status(400).send('No valid supplier is linked to user');
  if(!item)
    return res.status(400).send('No valid item was provided');

  //Finding item price in supplier schema
  //First find item, then using req.priceDelIndex, deleted limited price
  let priceDel;
  for (let i = 0; i < supplier.items.length; i++) {
    if(supplier.items[i].item.code === item.ref.code){
      priceDel = supplier.items[i].pricing.limited[req.body.priceDelIndex];
      supplier.items[i].pricing.limited.splice(req.body.priceDelIndex, 1);
      break;
    } else{
      continue;
    }
  }
  if(!priceDel)
    return res.status(400).send('This rebate was not found for this supplier');

  //Finding supplier price in item schema
  for (let i = 0; i < item.suppliers.length; i++) {
    if (item.suppliers[i].supplier === supplier.name){
      for (let j = 0; j < item.suppliers[i].pricing.limited.length; j++){
        const {typeOfRebate, X, Y, C, start, end} = item.suppliers[i].pricing
          .limited[j];
        if(typeOfRebate === priceDel.typeOfRebate && X === priceDel.X
          && Y === priceDel.Y && C === priceDel.C 
          && start.toString() === priceDel.start.toString()
          && end.toString() === priceDel.end.toString()
        )
        {
          item.suppliers[i].pricing.limited.splice(j, 1);
        }
      }
      break;
    } else {
      continue;
    }
  }

  await item.save();
  await supplier.save();
  return res.status(200).send('Pricing deletion successful');
});

router.get('/locations/:id', async (req, res) => {
  //Verify is id is an ObjectId
  if(!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send('No supplier was found');
  
  //Finding supplier
  const supplier = await Supplier
    .findOne({_id: req.params.id})
    .select('name locations')
    .populate('locations', 'name location');
  if(!supplier) return res.status(404).send('No supplier was found');
  //Return supplier
  return res.status(200).send(supplier);
});

router.post('/locations/me', isLoggedIn, isSupplier, async (req, res) => {
  //Validating that payload is an array of strings
  let {error} = valLocCreate(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  //Validating that user has right password
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password');

  //Testing if there is an existing supplier
  let supplier;
  if(req.user.account.isSupplier){
    supplier = await Supplier.findOne({name: req.user.meta.supplier});
    if (!supplier) return res.status(400)
      .send(`The user is not linked to an existing supplier`);
  }
  if(req.user.account.isAdmin){
    supplier = await Supplier.findOne({name: req.body.supplierName});
    if (!supplier) return res.status(400)
      .send(`No existing supplier was provided`);
  }

  //Filtering input
  let addPayload = [];
  let unknownPayload = [];
  let conflictPayload = [];

  for (const input of req.body.payload){
    //Geocoding
    const loc = await geocoder.geocode(input.address);

    //Testing success of geocoding
    if(loc.length <= 0){
      unknownPayload.push(input);
      continue;
    }

    //Preparing new location object
    const locContent = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress
    };

    //Testing for duplicates
    const existingLocation = await Location.findOne({location: locContent});
    if(existingLocation){
      conflictPayload.push(input);
      continue;
    }

    //Creating new location
    const newLocation = new Location({
      name: input.name,
      supplier: supplier._id,
      location: locContent
    });
    await newLocation.save();
    addPayload.push(newLocation._id);
  }

  //Sending error payload if exists
  let errorPayload = [];
  if(unknownPayload.length > 0){
    errorPayload.push({
      message: 'The following locations could not be found',
      data: unknownPayload
    });
  }
  if(conflictPayload.length > 0){
    errorPayload.push({
      message: 'The following locations already exist',
      data: conflictPayload
    });
  }
  if(errorPayload.length > 0) return res.status(213).send(errorPayload);

  //Return success status if all was ok
  supplier.locations = [...supplier.locations, ...addPayload];
  await supplier.save();
  return res.status(201).send('All locations were added successfully');
});

router.delete('/locations/me/:id', isLoggedIn, isSupplier, async (req, res) => {
  //Ensuring passwords are strings
  if(typeof req.body.supplierDeletePassword !== 'string' ||
  typeof req.body.adminDeletePassword !== 'string' ||
  typeof req.body.supplierName !== 'string'){
    return res.status(400).send('Password must be a string');
  }
    
  //Validating that user has right password
  const validPassword = await checkAuthPassword(req.user, req.body);
  if(!validPassword) return res.status(401).send('Invalid password');

  //Testing if there is an existing supplier
  let supplier;
  if(req.user.account.isSupplier){
    supplier = await Supplier.findOne({name: req.user.meta.supplier});
    if (!supplier) return res.status(400)
      .send(`The user is not linked to an existing supplier`);
  }
  if(req.user.account.isAdmin){
    supplier = await Supplier.findOne({name: req.body.supplierName});
    if (!supplier) return res.status(400)
      .send(`No existing supplier was provided`);
  }

  //Testing path
  if(!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(404).send('The provided location does not exist');
  const loc = await Location.findById(req.params.id);
  if(!loc) return res.status(404).send('The provided location does not exist');

  //Test if supplier = supplier
  if(supplier.id != loc.supplier)
    return res.status(401)
      .send('This location does not belong to this supplier');

  //Deleting location and ref in supplier
  await loc.deleteOne();
  supplier.locations = supplier.locations
    .filter(id => id.toString() !== req.params.id.toString());
  await supplier.save();

  return res.status(200).send('The location was deleted');
});

module.exports = router