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
      transaccionId: 123456,
      rowAffected: 1,
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

exports.getNotification = (req, res) => {
  try {
    const schema = Joi.object({
      notificationId: Joi.number().integer().min(1),
    });
    const validate = schema.validate(req.params);
    if(validate.error){
      throw validate.error;
    }
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: {
        id: 5,
        unRead: true,
        typeId: 0,
        shortMessage: 'Radicar factura PO-2394',
        sentDate: new Date().setDate(new Date().getMinutes - 60),
      },
    });
  } catch (err) {
    res.status(500).json({
      message: 'error',
      body: err.message,
    });
  }
};
