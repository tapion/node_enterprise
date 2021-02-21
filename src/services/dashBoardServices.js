const Joi = require('@hapi/joi');
const customerModel = require('../models/clientModel');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');

exports.dashBoardInformation = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    initialDate: Joi.date().max(Joi.ref('finalDate')).required(),
    finalDate: Joi.date().required(),
  });
  const validate = schema.validate(req.params);
  if (validate.error) {
    throw validate.error;
  }
  const generalReport = await customerModel.summaryOfWorksOrdersByDate(req.params.initialDate,req.params.finalDate);
  const summaryWorksOrdersPerCustomerByDate = await customerModel.summaryWorksOrdersPerCustomerByDate(req.params.initialDate,req.params.finalDate);
  const summaryWorksOrdersPerOperatorByDate = await customerModel.summaryWorksOrdersPerOperatorByDate(req.params.initialDate,req.params.finalDate);
  const summaryWorksOrdersPendingPerCustomerByDate = await customerModel.summaryWorksOrdersPendingPerCustomerByDate(req.params.initialDate,req.params.finalDate);
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: {
      generalReport,
      summaryWorksOrdersPerCustomerByDate,
      summaryWorksOrdersPerOperatorByDate,
      summaryWorksOrdersPendingPerCustomerByDate,
    },
  });
});
