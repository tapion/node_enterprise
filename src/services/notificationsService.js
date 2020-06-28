const Joi = require('@hapi/joi');

exports.addNotification = (req, res) => {
  try {
    const schema = Joi.object({
      unRead: Joi.boolean().required(),
      typeId: Joi.number().integer().min(0),
      shortMessage: Joi.string().required().min(10),
      sentDate: Joi.date().iso(),
    });
    const validate = schema.validate(req.body);
    if (validate.error) {
      throw validate.error;
    }
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: {
        id: 10,
        unRead: req.body.unRead,
        typeId: req.body.typeId,
        shortMessage: req.body.shortMessage,
        sentDate: req.body.sentDate,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: 'error',
      body: err.message,
    });
  }
};
