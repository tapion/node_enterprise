const Joi = require('@hapi/joi');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/usersModel');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');

const validatePassword = async (possiblePassword, password) => {
  return await bcrypt.compare(possiblePassword, password);
};

const createToken = (user) => {
  return jwt.sign(
    {
      email: user.email,
      name: user.name,
      userName: user.userName,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE_IN,
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
    throw new Error('User or email invalid', 403);
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: { token: createToken(user.rows[0]) },
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
