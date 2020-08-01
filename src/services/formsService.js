const Joi = require('@hapi/joi');
const db = require('../db/index');

exports.create = (req, res) => {
  try {
    // db.query(
    //   'SELECT * FROM hola where id = $1', [1],
    //   (err, res) => {
    //     console.log(res.rows[0]);
    //   }
    // );

    db.getClient((err, client, done )=>{
      client.query('SELECT * FROM hola where id = $1', [1],(err, res) => {
        console.log(res.rows[0]);
        done();
      })
    });

    const schema = Joi.object({
      id: Joi.number().integer().allow(null).empty(''),
      name: Joi.string().required(),
      description: Joi.string().required(),
      state: Joi.boolean().required(),
      questions: Joi.array().items(
        Joi.object({
          id: Joi.number().integer().allow(null).empty(''),
          title: Joi.string().required(),
          description: Joi.string().required(),
          type: Joi.string().required(),
          icon: Joi.string(),
          value: Joi.string().required(),
          conditions: Joi.array(),
          isRequired: Joi.boolean().required(),
          invalidMessageKey: Joi.string().required(),
          source: Joi.object({
            idTable: Joi.string(),
            nameSource: Joi.string(),
            values: Joi.array().items(
              Joi.object({
                id: Joi.number().integer().required(),
                name: Joi.string().required(),
                value: Joi.string().required(),
                state: Joi.boolean().required(),
              })
            ),
          }),
        })
      ),
    });
    const validate = schema.validate(req.body);
    if (validate.error) {
      throw validate.error;
    }
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: [
        {
          id: 1,
          name: 'Actividad 1',
          date: new Date().setDate(new Date().getMinutes() - 30),
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
          date: new Date().setDate(new Date().getMinutes() - 60),
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
          date: new Date().setDate(new Date().getMinutes() - 120),
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
