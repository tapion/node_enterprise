const Joi = require('@hapi/joi');
const templateModel = require('./../models/templatesModel');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');

exports.saveTemplate =  wrapAsyncFn(async (req, res) => {
    const shema = Joi.object({
        id: Joi.number().integer().allow(null).empty(''),
        name: Joi.string().required(),
        description: Joi.string().required(),
        template: Joi.string().required(),
        state: Joi.boolean().required(),
    });
    const validate = shema.validate(req.body);
    if (validate.error) {
      throw validate.error;
    }
    const template = await templateModel.saveTemplate(req.body,req.userLoged)
    const templareResponse = { ...req.body}
    templareResponse.id = template.rows[0].id;
    res.status(201).json({
        status: 201,
        message: 'lbl_resp_succes',
        serverTime: Date.now(),
        data: templareResponse,
    });
});
