const Joi = require('@hapi/joi');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');
const clientModel = require('../models/clientModel');

exports.createClients = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    nit: Joi.string().min(5).required(),
    businessName: Joi.string().min(3).required(),
    address: Joi.string().min(5).required(),
    country: Joi.string().max(2).required(),
    city: Joi.number().integer().min(1).required(),
    phone: Joi.string().min(6).required(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    contacts: Joi.array().items(
      Joi.object({
        name: Joi.string().required(),
        email: Joi.string()
          .email({ tlds: { allow: false } })
          .required(),
        phone: Joi.string().required(),
      })
    ),
    offices: Joi.array().items(
      Joi.object({
        nit: Joi.string().min(5).required(),
        businessName: Joi.string().min(3).required(),
        address: Joi.string().min(5).required(),
        country: Joi.string().max(2).required(),
        city: Joi.number().integer().min(1).required(),
        phone: Joi.string().min(6).required(),
        contacts: Joi.array().items(
          Joi.object({
            name: Joi.string().required(),
            email: Joi.string()
              .email({ tlds: { allow: false } })
              .required(),
            phone: Joi.string().required(),
          })
        ),
      })
    ),
  });
  const validate = schema.validate(req.body);
  if (validate.error) {
    throw validate.error;
  }
  const newClient = await clientModel.createClient(req.body, {
    name: 'miguel.vargas',
  });
  res.status(201).json({
    status: 201,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: newClient,
  });
});

exports.getClients = (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: [
        {
          id: 1,
          name: 'Cumis',
        },
        {
          id: 2,
          name: 'Pepsi',
        },
        {
          id: 3,
          name: 'Vanti',
        },
        {
          id: 5,
          name: 'Enel',
        },
        {
          id: 4,
          name: 'ETB',
        },
      ],
    });
  } catch (err) {
    res.status(500).json({
      message: 'error',
      body: err.message,
    });
  }
};
