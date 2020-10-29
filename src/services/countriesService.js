const Joi = require('@hapi/joi');
const countryModel = require('../models/countryModel');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');

exports.getcountries = wrapAsyncFn(async (req, res) => {
  const countries = await countryModel.countries();
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: countries.rows,
  });
});

exports.citiesByCountry = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    countryIso: Joi.string().min(2).required(),
  });
  const validate = schema.validate(req.params);
  if (validate.error) {
    throw validate.error;
  }
  const cities = await countryModel.citiesByCountry(req.params.countryIso);
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: cities.rows,
  });
});
