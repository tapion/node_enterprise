const Joi = require('@hapi/joi');

exports.getWorkFlows = (req, res) => {
  try {
    const schema = Joi.object({
      dateType: Joi.number().integer().min(0).required(),
      starDate: Joi.date().max(Joi.ref('endDate')).required(),
      endDate: Joi.date().required(),
      idClient: Joi.number().integer().min(0).required(),
      idOperator: Joi.number().integer().min(0).required(),
      idDivision: Joi.number().integer().min(0).required(),
      idState: Joi.number().integer().min(0).required(),
    });
    const validate = schema.validate(req.query);
    if(validate.error){
        throw validate.error;
    }
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: [
        {
          id: 1,
          name: 'Actividad 1',
          date: new Date().setDate(new Date().getMinutes - 30),
          client: {
            id: 2,
            name: 'Pepsi',
          },
          operator: {
            id: 12,
            name: 'Patron',
          },
          zone: {
            id: 3,
            name: 'Sur Oriente',
          },
          state: {
            id: 1,
            name: 'Sin asignar',
          },
        },
        {
          id: 2,
          name: 'Actividad 2',
          date: new Date().setDate(new Date().getMinutes - 60),
          client: {
            id: 1,
            name: 'Cumis',
          },
          operator: {
            id: 11,
            name: 'Jerson',
          },
          zone: {
            id: 5,
            name: 'Sur',
          },
          state: {
            id: 4,
            name: 'Sin firma',
          },
        },
        {
          id: 3,
          name: 'Actividad 3',
          date: new Date().setDate(new Date().getMinutes - 120),
          client: {
            id: 3,
            name: 'Vanti',
          },
          operator: {
            id: 56,
            name: 'Juan',
          },
          zone: {
            id: 6,
            name: 'Norte',
          },
          state: {
            id: 5,
            name: 'Cerrada',
          },
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
