const Joi = require('@hapi/joi');
const orderModel = require('../models/orderModel');

exports.saveTypeOrderAndTask = async (req, res) => {
  try {
    const schema = Joi.object({
      idTypeOrder: Joi.number().integer().required(),
      tasks: Joi.array().items(
        Joi.object({
          idTask: Joi.number().integer().required(),
          status: Joi.boolean().required(),
        })
      ),
      idUser: Joi.string().required(),
    });
    const validate = schema.validate(req.body);
    if (validate.error) {
      throw validate.error;
    }
    await orderModel.saveTypeOrderAndTask(req.body);
    res.status(201).json({
      status: 201,
      message: 'lbl_resp_succes',
      serverTime: Date.now(),
      data: req.body,
    });
  } catch (e) {
    res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};

exports.validateTypeOrder = (req, res, next) => {
  const schema = Joi.object({
    idTypeOrder: Joi.number().integer().min(1).required(),
  });
  const validate = schema.validate(req.params);
  if (validate.error) {
    res.status(400).json({
      status: 400,
      message: validate.error.details,
    });
    throw validate.error;
  }
  next();
};

exports.updateTypeOrderAndTask = async (req, res) => {
  try {
    const schema = Joi.object({
      tasks: Joi.array().items(
        Joi.object({
          idTask: Joi.number().integer().required(),
          status: Joi.boolean().required(),
        })
      ),
      idUser: Joi.string().required(),
    });
    const validate = schema.validate(req.body);
    if (validate.error) {
      throw validate.error;
    }
    await orderModel.updateTypeOrderAndTask(req.body, req.params.idTypeOrder);
    res.status(201).json({
      status: 201,
      message: 'lbl_resp_succes',
      serverTime: Date.now(),
      data: req.body,
    });
  } catch (e) {
    res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};
exports.deleteTypeOrderAndTask = async (req, res) => {
  try {
    const schema = Joi.object({
      idTask: Joi.number().integer().required().min(1),
      idTypeOrder: Joi.number().integer().min(1).required(),
    });
    const validate = schema.validate(req.params);
    if (validate.error) {
      throw validate.error;
    }
    await orderModel.deleteTypeOrderAndTask(req.params);
    res.status(201).json({
      status: 201,
      message: 'lbl_resp_succes',
      serverTime: Date.now(),
      data: {},
    });
  } catch (e) {
    res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};
exports.getAllTypeOrderAndTask = async (req, res) => {
  try {
    const tasks = await orderModel.getAllTypeOrderAndTask(
      req.params.idTypeOrder
    );
    res.status(200).json({
      status: 200,
      message: 'lbl_resp_succes',
      serverTime: Date.now(),
      data: {
        tasks,
        idTypeOrder: req.params.idTypeOrder,
      },
    });
  } catch (e) {
    res.status(500).json({
      status: 500,
      message: e.message,
    });
  }
};
