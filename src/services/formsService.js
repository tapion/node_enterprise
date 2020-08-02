const Joi = require('@hapi/joi');
const formModel = require('../models/formModel');

const sectionId = 6;
const getSections = (body) => {
  return {
    sections: body.elements.filter((el) => el.type === sectionId),
    questions: body.elements.filter((el) => el.type !== sectionId),
  };
};

const prepareResponse = (req, obj) => {
  req.forEach((el) => {
    const tmp = obj.find((objEle) => objEle.id == el.id);
    if (tmp) {
      el.id = el.idk;
      el.idSection = tmp.section_idk || null;
      el.isNew = false;
    }
    return el;
  });
};

exports.create = async (req, res) => {
  try {
    const schema = Joi.object({
      id: Joi.number().integer().allow(null).empty(''),
      name: Joi.string().required(),
      description: Joi.string().required(),
      state: Joi.boolean().required(),
      userName: Joi.number().integer().required(),
      elements: Joi.array().items(
        Joi.object({
          id: Joi.number().integer().allow(null).empty(''),
          title: Joi.string().required(),
          description: Joi.string().required(),
          type: Joi.number().integer().required(),
          icon: Joi.string(),
          // value: Joi.string().required(),
          conditions: Joi.array().items(
            Joi.object({
              id: Joi.number().integer().required(),
              source: Joi.number().integer().required(),
              sourceProperty: Joi.string().required(),
              sourceValue: Joi.string().required(),
              target: Joi.number().integer().required(),
              targetProperty: Joi.string().required(),
              targetValue: Joi.string().required(),
              state: Joi.boolean().required(),
              // isNew: Joi.boolean().required(),
            })
          ),
          isRequired: Joi.boolean().required(),
          idSection: Joi.number().integer().allow(null).empty(''),
          // invalidMessageKey: Joi.string().required(),
          idTable: Joi.number().integer().allow(null).empty(''),
          nameSource: Joi.string().allow(null).empty(''),
          // userName: Joi.number().integer().required(),
          source: Joi.array().items(
            Joi.object({
              id: Joi.number().integer().required(),
              name: Joi.string().required(),
              value: Joi.string().required(),
              state: Joi.boolean().required(),
              // isNew: Joi.boolean().required(),
            })
          ),
          isNew: Joi.boolean().required(),
        })
      ),
    });
    const validate = schema.validate(req.body);
    if (validate.error) {
      throw validate.error;
    }
    const { sections, questions } = getSections(req.body);
    const { body, sec, quest } = await formModel.CreateForm(
      req.body,
      sections,
      questions
    );
    prepareResponse(body.elements, sec);
    prepareResponse(body.elements, quest);
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: body,
    });
  } catch (err) {
    res.status(500).json({
      message: 'error',
      body: err.message,
    });
  }
};
