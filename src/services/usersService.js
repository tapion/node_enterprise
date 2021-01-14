const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/usersModel');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');
const auth = require('./auth');
const AppError = require('../utils/appError');

const validatePassword = async (possiblePassword, password) => {
  return bcrypt.compare(possiblePassword, password);
};

const createToken = (user, expiredTime) => {
  return jwt.sign(
    {
      email: user.email,
      name: user.name,
      userName: user.userName,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: expiredTime,
    }
  );
};

exports.validateUserId = (req,res,next) => {
  const schema = Joi.object({
    userId: Joi.number().integer().required()
  });
  const validate = schema.validate(req.params);
  if (validate.error) next(new AppError(validate.error.message,400));
  next();
}
exports.validateUserBody = (req,res,next) => {
  const schema = Joi.object({
    id: Joi.number().integer().allow(null).empty(''),
    identificationType: Joi.object({
      id: Joi.number().integer().required(),
      name: Joi.string().required(),
    }).required(),
    identificationNumber: Joi.string().required(),
    genre: Joi.object({
      id: Joi.number().integer().required(),
      name: Joi.string().required(),
    }).required(),
    country: Joi.object({
      iso: Joi.string().required(),
      name: Joi.string().required(),
    }).required(),
    firstNames: Joi.string().required(),
    lastNames: Joi.string().required(),
    picture: Joi.string().required(),
    login: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    phone: Joi.string().required(),
    active: Joi.boolean().required(),
    creationUser: Joi.string().allow(null).empty(''),
    creationDate: Joi.string().allow(null).empty(''),
    modificationUser: Joi.string().allow(null).empty(''),
    modificationDate: Joi.string().allow(null).empty(''),
    roles: Joi.array().items(
      Joi.object({
        id: Joi.number().integer().required(),
        name: Joi.string().required(),
      })
    ),
  });
  const validate = schema.validate(req.body);
  if (validate.error) next(new AppError(validate.error.message,400));
  next();
}

exports.login = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().required(),
  });
  const validate = schema.validate(req.body);
  if (validate.error) throw new AppError(validate.error.message,400);
  const user = await userModel.getUser(req.body.email);
  if (
    user.rows.length <= 0 ||
    !await validatePassword(req.body.password, user.rows[0].password)
  )
    throw new AppError('User or email invalid', 403);
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: {
      token: createToken(user.rows[0], process.env.JWT_EXPIRE_IN),
      operatorId: user.rows[0].operatorId,
      'refresh-token': createToken(
        user.rows[0],
        process.env.JWT_EXPIRE_REFRESH
      ),
    },
  });
});

exports.updatePassword = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
      oldPassword: Joi.string().required(),
      newPassword: Joi.string().required(),
  });
  const validate = schema.validate(req.body);
  if (validate.error) throw new AppError(validate.error.message,400);
  const user = await userModel.getUserByIdForPassword(req.params.userId);
  if (
    user.rows.length <= 0 ||
    !await validatePassword(req.body.oldPassword, user.rows[0].password)
  )
    throw new AppError('User or email invalid', 403);

  await userModel.updatePassword(req.params.userId, await bcrypt.hash(req.body.newPassword, 12));
  
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: {},
  });
});

exports.refreshToken = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    'refresh-token': Joi.string().required(),
  });
  const validate = schema.validate(req.body);
  if (validate.error) throw validate.error;
  const user = await auth.validateRefreshToken(req.body['refresh-token']);
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: {
      token: createToken(user.rows[0], process.env.JWT_EXPIRE_IN),
      'refresh-token': req.body['refresh-token'],
    },
  });
});

exports.signUp = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().required(),
    name: Joi.string().required(),
    userName: Joi.string().required(),
  });
  const validate = schema.validate(req.body);
  if (validate.error) throw validate.error;
  await userModel.createUser(
    req.body,
    await bcrypt.hash(req.body.password, 12)
  );
  res.status(201).json({
    status: 201,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: { ...req.body },
  });
});


exports.getAllUsers = wrapAsyncFn(async (req, res) => {
  const users = await userModel.getAllUsers();
  const rowAffected = users.length;
  res.status(200).json({
    status: 200,
    rowAffected,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: users,
  });
});

exports.getUserById = wrapAsyncFn(async (req, res) => {
  const users = await userModel.getUserById(req.params.userId);
  const rowAffected = users.length;
  res.status(200).json({
    status: 200,
    rowAffected,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: users,
  });
});

exports.deleteUserById = wrapAsyncFn(async (req, res) => {
  const users = await userModel.deleteById(req.params.userId,req.userLoged);
  res.status(200).json({
    status: 200,
    rowAffected: users.rowCount,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: {},
  });
});

exports.saveUser = wrapAsyncFn(async (req, res) => {
  const users = await userModel.createUser(req.body,req.userLoged, await bcrypt.hash(req.body.password, 12));
  res.status(201).json({
    status: 201,
    rowAffected: users.rowCount,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: {...req.body,id:users.rows[0].id, password: undefined},
  });
});

exports.updateUser = wrapAsyncFn(async (req, res) => {
  const users = await userModel.updateUser(req.params.userId,req.body,req.userLoged);
  res.status(201).json({
    status: 201,
    rowAffected: users.rowCount,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: req.body,
  });
});
