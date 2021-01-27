const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const userModel = require('../models/usersModel');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');
const AppError = require('../utils/appError');

exports.validRoles = (...roles) => {
  return (req, res, next) => {
    let find = false;
    roles.forEach((rol) => {
      if (req.authRoles.includes(rol)) {
        find = true;
      }
    });
    if (find) {
      next();
    } else {
      next(new AppError('User do not allowed to this action', 403));
    }
  };
};

exports.validateRefreshToken = async (accessTkn) => {
  try{
    const tokenData = await promisify(jwt.verify)(
      accessTkn,
      process.env.JWT_SECRET
    );
    if (!tokenData.email) {
      throw new AppError('Invalids token', 401);
    }
    const user = await userModel.getUser(tokenData.email);
    if (user.rows <= 0) {
      throw new AppError('Invalids token', 401);
    }
    if (
      user.rows[0].changedPasswordAt &&
      tokenData.iat < user.rows[0].changedPasswordAt.getTime() / 1000
    ) {
      throw new AppError('Undefined token error', 401);
    }
    return user;
  }catch(e){
    if(e.name === 'TokenExpiredError') throw new AppError('Invalids token', 401);
    throw new AppError('Invalids token', 500);  
  }
};

exports.getVerifyMiddleware = wrapAsyncFn(async (req, res, next) => {
  try{
    const autorization = req.get('Authorization');
    if (!autorization) {
      return next(new AppError('Token missing', 401));
    }
    const token = autorization.split(' ')[1];
    const tokenData = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    if (!tokenData.email) {
      return next(new AppError('Invalids token', 401));
    }
    const user = await userModel.getUser(tokenData.email);
    if (user.rows <= 0) {
      return next(new AppError('User does not exist', 404));
    }
    if (
      user.rows[0].changedPasswordAt &&
      tokenData.iat < user.rows[0].changedPasswordAt.getTime() / 1000
    ) {
      return next(new AppError('Token expired', 400));
    }
    req.userLoged = tokenData;
    next();
  }catch(e){
    if(e.name === 'TokenExpiredError') return next(new AppError('Token expired', 400));
    return next(new AppError('Undefined token error', 500));  
  }
});
