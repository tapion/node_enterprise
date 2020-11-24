const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/usersModel');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');
const auth = require('./auth');
const AppError = require('../utils/appError');

const validatePassword = async (possiblePassword, password) => {
  return await bcrypt.compare(possiblePassword, password);
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

exports.login = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    password: Joi.string().required(),
  });
  const validate = schema.validate(req.body);
  if (validate.error) throw validate.error;
  const user = await userModel.getUser(req.body.email);
  if (
    user.rows.length <= 0 ||
    !validatePassword(req.body.password, user.rows[0].password)
  )
    throw new AppError('User or email invalid', 403);
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: {
      token: createToken(user.rows[0], process.env.JWT_EXPIRE_IN),
      operatorId: 50,
      'refresh-token': createToken(
        user.rows[0],
        process.env.JWT_EXPIRE_REFRESH
      ),
    },
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
      refresh: req.body['refresh-token'],
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
