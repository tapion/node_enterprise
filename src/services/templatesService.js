const Joi = require('@hapi/joi');
const templateModel = require("../models/templatesModel");
const wrapAsyncFn = require('../utils/wrapAsyncFunction');
const AppError = require('../utils/appError');


exports.templateDataValidation = (req,res, next) => {
    const shema = Joi.object({
        id: Joi.number().integer().allow(null).empty(''),
        name: Joi.string().required(),
        description: Joi.string().required(),
        template: Joi.string().required(),
        state: Joi.boolean().required(),
    });
    const validate = shema.validate(req.body);
    if (validate.error) {
        next(validate.error);
    }
    next();
}

exports.validaCostumerIdParam = (req, res, next) => {
    const schema = Joi.object({
        idTemplate: Joi.number().integer().min(1).required(),
    });
    const validate = schema.validate(req.params);
    if (validate.error) {
      next(validate.error);
    }
    next();
};

exports.saveTemplate =  wrapAsyncFn(async (req, res) => {
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

exports.updateTemplate =  wrapAsyncFn(async (req, res) => {
    const template = await templateModel.getTemplatesById(req.params.idTemplate)
    if(template.rows.length <= 0)
        throw new AppError(
            `Not found template for id: ${req.params.idTemplate}`,
            404
        );
    await templateModel.updateTemplate(req.params.idTemplate,req.body,req.userLoged)
    const templareResponse = { ...req.body}
    templareResponse.id = req.params.idTemplate;
    res.status(201).json({
        status: 201,
        message: 'lbl_resp_succes',
        serverTime: Date.now(),
        data: templareResponse,
    });
});


exports.getAllTemplates = wrapAsyncFn(async (req,res) => {
    const template = await templateModel.getAllTemplates()
    res.status(200).json({
        status: 200,
        message: 'lbl_resp_succes',
        serverTime: Date.now(),
        data: template.rows,
    });
});

exports.getTemplatesById = wrapAsyncFn(async (req,res) => {
    const template = await templateModel.getTemplatesById(req.params.idTemplate)
    res.status(200).json({
        status: 200,
        message: 'lbl_resp_succes',
        serverTime: Date.now(),
        data: template.rows,
    });
});

exports.deleteTemplate = wrapAsyncFn(async (req,res) => {
    await templateModel.deleteTemplate(req.params.idTemplate,req.userLoged)
    res.status(200).json({
        status: 200,
        message: 'lbl_resp_succes',
        serverTime: Date.now(),
        data: {},
    });
});