const Joi = require('@hapi/joi');

exports.getNotificationsByUser = (req, res) => {
  try {
    const schema = Joi.object({
      userId: Joi.number().integer().min(1).required(),
    });
    const validate = schema.validate(req.params);
    if (validate.error) throw validate.error;
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: [
        {
          id: 5,
          unRead: true,
          typeId: 1,
          shortMessage: 'Es el camioin placa DBF79E',
          sentDate: new Date().setDate(new Date().getMinutes() - 15),
        },
        {
          id: 6,
          unRead: true,
          typeId: 1,
          shortMessage: 'Firmar orden por Ricardo Galvis',
          sentDate: new Date().setDate(new Date().getMinutes() - 25),
        },
        {
          id: 15,
          unRead: false,
          typeId: 1,
          shortMessage: 'El equipo a revisar esta en el segundo piso',
          sentDate: new Date().setDate(new Date().getMinutes() - 45),
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
