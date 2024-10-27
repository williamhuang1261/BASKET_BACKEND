const jwt = require('jsonwebtoken');
const config = require('config');
const {User} = require('../models/users')

module.exports = async function(req, res, next) {
  //Validating existing token
  const currentToken = req.header('x-auth-token');
  if(!currentToken)
    return res.status(401).send('User is not properly logged in');

  //Validating token
  try{
    const decoded = jwt.verify(currentToken, config.get('jwtPrivateKey'));
    req.user = await User.findById(decoded._id)
    if(!req.user) return res.status(400).send('This user does not exist')
    next();
  }
  catch(ex){
    res.status(400).send('Invalid token.');
  }
}
