const express = require('express');
const users = require('../routes/users');
const logIn = require('../routes/login');
const search = require('../routes/search')
const items = require('../routes/items');
const suppliers = require('../routes/suppliers');
const confirmations = require('../routes/confirmations');
const error = require('../middleware/error');

module.exports = function(app) {
  app.use(express.json());
  app.use('/api/users', users);
  app.use('/api/login', logIn);
  app.use('/api/confirmations', confirmations)
  app.use('/api/items', items);
  app.use('/api/suppliers', suppliers);
  app.use('/api/search', search);
  app.use(error);
};