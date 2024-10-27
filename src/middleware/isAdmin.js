
module.exports = async function (req, res, next) {
  if (!req.user.account.isAdmin)
    return res.status(403).send('Access denied');
  next();
}