const Joi = require('@hapi/joi');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');

exports.createClients = wrapAsyncFn((req, res) => {
  const schema = Joi.object({
    id: Joi.number().integer().allow(null).empty(''),
    nit: Joi.string().min(5).required(),
    businessName: Joi.string().min(5).required(),
    adress: Joi.string().min(5).required(),
    phone: Joi.string().min(6).required(),
    email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    status: Joi.boolean().required(),
    contacts: Joi.array().items(
      Joi.object({
        id: Joi.number().integer().allow(null).empty(''),
        name: Joi.string().required(),
        email: Joi.string()
          .email({ tlds: { allow: false } })
          .required(),
        phone: Joi.string().required(),
        state: Joi.boolean().required(),
      })
    ),
    offices: Joi.array().items(Joi.object({})),
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
