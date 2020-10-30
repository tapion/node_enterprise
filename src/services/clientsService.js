const Joi = require('@hapi/joi');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');
const clientModel = require('../models/clientModel');

exports.validaCostumerIdParam = (req, res, next) => {
  const schema = Joi.object({
    idCustomer: Joi.number().integer().min(1).required(),
  });
  const validate = schema.validate(req.params);
  if (validate.error) {
    next(validate.error);
  }
  next();
};

exports.createAndupdateValidations = (req, res, next) => {
  const schema = Joi.object({
    id: Joi.number().integer().allow(null).empty(''),
    nit: Joi.string().min(5).required(),
    businessName: Joi.string().min(3).required(),
    address: Joi.string().min(5).required(),
    country: Joi.string().max(2).required(),
    city: Joi.number().integer().min(1).required(),
    phone: Joi.string().min(6).required(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    state: Joi.boolean(),
    contacts: Joi.array().items(
      Joi.object({
        id: Joi.number().integer().allow(null).empty(''),
        name: Joi.string().required(),
        email: Joi.string()
          .email({ tlds: { allow: false } })
          .required(),
        phone: Joi.string().required(),
        state: Joi.boolean(),
      })
    ),
    offices: Joi.array().items(
      Joi.object({
        id: Joi.number().integer().allow(null).empty(''),
        nit: Joi.string().allow(null),
        businessName: Joi.string().min(3).required(),
        address: Joi.string().min(5).required(),
        phone: Joi.string().min(6).required(),
        email: Joi.string()
          .email({ tlds: { allow: false } })
          .required(),
        country: Joi.string().max(2).required(),
        city: Joi.number().integer().min(1).required(),
        state: Joi.boolean(),
        contacts: Joi.array()
          .items(
            Joi.object({
              id: Joi.number().integer().allow(null).empty(''),
              name: Joi.string().required(),
              email: Joi.string()
                .email({ tlds: { allow: false } })
                .required(),
              phone: Joi.string().required(),
              state: Joi.boolean(),
            })
          )
          .allow(null)
          .empty(''),
      })
    ),
  });
  const validate = schema.validate(req.body);
  if (validate.error) {
    next(validate.error);
  }
  next();
};

exports.createClients = wrapAsyncFn(async (req, res) => {
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

exports.getClients = wrapAsyncFn(async (req, res) => {
  const costumers = await clientModel.allCostumers();
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: costumers.rows,
  });
});

exports.deleteCustomer = wrapAsyncFn(async (req, res) => {
  /** TODO: Ajustar temas del usuario */
  await clientModel.deleteCustomer(req.params.idCustomer, {
    name: 'miguel.vargas',
  });
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: {},
  });
});

exports.getCustomerById = wrapAsyncFn(async (req, res) => {
  const customer = await clientModel.getCustomerById(req.params.idCustomer);
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: customer,
  });
});

exports.updateCustomer = wrapAsyncFn(async (req, res) => {
  const newClient = await clientModel.updateClient(req.body, {
    name: 'miguel.vargas',
  });
  res.status(201).json({
    status: 201,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: newClient,
  });
});
