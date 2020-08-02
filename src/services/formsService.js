const Joi = require('@hapi/joi');
const formModel = require('../models/formModel');

exports.create = async (req, res) => {
  try {
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
    const test = await formModel.CreateForm(req.body);
    console.log('termino con',test);
    // formModel.test(req.body.questions[0].source.values);
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: {
        test,
      },
    });
  } catch (err) {
    res.status(500).json({
      message: 'error',
      body: err.message,
    });
  }
};
