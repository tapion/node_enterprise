const Joi = require('@hapi/joi');

exports.dashBoardInformation = (req, res) => {
  try {
    const schema = Joi.object({
      initDate: Joi.date().max(Joi.ref('finDate')).required(),
      finDate: Joi.date().required(),
    });
    const validate = schema.validate(req.params);
    if (validate.error) {
      throw validate.error;
    }
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: {
        totalOrdersReport: 150,
        processed: 50,
        inProgress: 30,
        queued: 70,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: 'error',
      body: err.message,
    });
  }
};
