const CognitoExpress = require('cognito-express');
const AppError = require('../utils/appError');

const cognitoExpress = new CognitoExpress({
  region: process.env.AUTH_COGNITO_REGION,
  cognitoUserPoolId: process.env.AUTH_COGNITO_POOLID,
  tokenUse: process.env.AUTH_LIBRARY_TOKENUSE,
  tokenExpiration: process.env.AUTH_COGNITO_TKNEXPIRATION,
});

exports.protect = function (req, res, next) {
  const accessTokenFromClient = req.headers['access-token'];

  if (!accessTokenFromClient){
    return next(new AppError('You must send the token', 401));
  }

  cognitoExpress.validate(accessTokenFromClient, function (err, response) {
    if (err) {
      return next(new AppError(`Token doesn't valid`, 401));
    }
    res.locals.user = response;
    next();
  });
};
