const Joi = require('@hapi/joi');
const formModel = require('../models/formModel');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');
const AppError = require('../utils/appError');

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

exports.validateForm = (req, res, next, val) => {
  const schema = Joi.object({
    id: Joi.number().integer().allow(null).empty(''),
    name: Joi.string().required(),
    description: Joi.string().required(),
    state: Joi.boolean().required(),
    userName: Joi.string().required(),
    elements: Joi.array().items(
      Joi.object({
        id: Joi.number().integer().allow(null).empty(''),
        title: Joi.string().required(),
        description: Joi.string().required(),
        type: Joi.number().integer().required(),
        icon: Joi.string(),
        placeHolder: Joi.string(),
        value: Joi.string(),
        isReadOnly: Joi.boolean(),
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
          })
        ),
        isRequired: Joi.boolean().required(),
        idSection: Joi.number().integer().allow(null).empty(''),
        idTable: Joi.number().integer().allow(null).empty(''),
        nameSource: Joi.string().allow(null).empty(''),
        source: Joi.array().items(
          Joi.object({
            id: Joi.number().integer().required(),
            name: Joi.string().required(),
            value: Joi.string().required(),
            state: Joi.boolean().required(),
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
  next();
};

exports.create = wrapAsyncFn(async (req, res) => {
  const { sections, questions } = getSections(req.body);
  const { body, sec, quest } = await formModel.CreateForm(
    req.body,
    sections,
    questions,
    req.userLoged,
    req.get('Authorization')
  );
  prepareResponse(body.elements, sec);
  prepareResponse(body.elements, quest);
  res.status(201).json({
    status: 201,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: body,
  });
});

exports.updateForm = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    formId: Joi.number().integer().min(1).required(),
  });
  const validate = schema.validate(req.params);
  if (validate.error) {
    throw validate.error;
  }
  const { sections, questions } = getSections(req.body);
  const { body, sec, quest } = await formModel.updateForm(
    req.body,
    sections,
    questions,
    req.params.formId,
    req.userLoged,
    req.get('Authorization')
  );
  prepareResponse(body.elements, sec);
  prepareResponse(body.elements, quest);
  res.status(201).json({
    status: 201,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: body,
  });
});

exports.deleteForm = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    formId: Joi.number().integer().min(1).required(),
  });
  const validate = schema.validate(req.params);
  if (validate.error) {
    throw validate.error;
  }
  await formModel.deleteForm(req.params, req.userLoged);
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: {},
  });
});

const buildElements = (resp) => {
  return resp.map((el) => {
    return {
      id: el.id,
      title: el.title,
      description: el.description || '',
      placeHolder: el.placeholder || '',
      value: el.value || '',
      type: el.type || sectionId,
      isNew: false,
      icon: el.icon ? el.icon : '',
      isRequired: el.isrequired ? el.isrequired : false,
      isReadOnly: el.readonly || false,
      idSection: el.section_id || null,
      idTable: el.source_idtable || null,
      nameSource: el.source_namesource || null,
      source: el.source_values,
      conditions:
        typeof el.conditions === 'object' && el.conditions[0]
          ? el.conditions
          : [],
    };
  });
};

const orderSectionsAndQuestions = (sec, que) => {
  let res = [];
  sec.forEach((section) => {
    res.push(section);
    res = res.concat(que.filter((el) => el.idSection === section.id));
  });
  return res;
};

const orderSectionsAndQuestionsForWeb = (sec, que) => {
  sec.forEach((section) => {
    section.questions = que.filter((el) => el.idSection === section.id);
  });
  return sec;
};


exports.getForm = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    formId: Joi.number().integer().min(1).required(),
  });
  const validate = schema.validate(req.params);
  if (validate.error) {
    throw validate.error;
  }
  const form = await formModel.getFormById(req.params.formId);
  if (form.rowCount === 0) {
    throw new AppError(`Not found form id: ${req.params.formId}`,200);
  }
  const sectionsResponse = await formModel.getSectionsByForm(req.params.formId);
  const questionsResponse = await formModel.getQuestionsByForm(
    req.params.formId,req.get('Authorization')
  );
  const sections = buildElements(sectionsResponse.rows);
  const questions = buildElements(questionsResponse);

  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: {
      id: form.rows[0].id,
      name: form.rows[0].name,
      description: form.rows[0].description,
      state: form.rows[0].state,
      userName: form.rows[0].user_creation,
      elements: orderSectionsAndQuestions(sections, questions),
    },
  });
});

exports.getAll = wrapAsyncFn(async (req, res) => {
  const form = await formModel.getAllForms();
  if (form.rowCount === 0) {
    throw new AppError(`Not found forms`,200);
  }
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: form.rows,
  });
});

exports.validateTaskId = (req, res, next) => {
  const schema = Joi.object({
    idTask: Joi.number().integer().min(1).required(),
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

exports.getFormsByTask = wrapAsyncFn(async (req, res) => {
  const form = await formModel.getFormsByTask(req.params.idTask);
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: {
      idTask: req.params.idTask,
      forms: form.rows || 0,
    },
  });
});

exports.getFormsByTypeOrder = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    typeOrder: Joi.number().integer().min(1).required(),
  });
  const validate = schema.validate(req.params);
  if (validate.error) {
    throw validate.error;
  }
  const forms = await formModel.getFormByTypeOrder(req.params.typeOrder);
  if (forms.rowCount === 0) {
    throw new AppError(
      `Not found forms for Type Order: ${req.params.typeOrder}`,
      200
    );
  }
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: forms,
  });
});

exports.getFormsByTaskPerUser = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    taskId: Joi.number().integer().min(1).required(),
  });
  const validate = schema.validate(req.params);
  if (validate.error) {
    throw validate.error;
  }
  const recorsetForms = await formModel.getFormByTask(req.params.taskId,req.userLoged);
  const forms = await Promise.all(recorsetForms.rows.map(async frm => {
      const form = {};
      const sectionsResponse = await formModel.getSectionsByForm(frm.formId);
      const questionsResponse = await formModel.getQuestionsByForm(
      frm.formId,req.get('Authorization')
      );
      const sections = buildElements(sectionsResponse.rows);
      const questions = buildElements(questionsResponse);
      form.id = frm.formId;
      form.name = frm.name;
      form.description = frm.description;
      form.state= frm.state;
      form.userName= frm.user_creation;
      form.sections= orderSectionsAndQuestionsForWeb(sections, questions);
      return form;
  }));

  if (forms.rowCount === 0) {
    throw new AppError(
      `Not found forms for Task: ${req.params.taskId}`,
      200
    );
  }
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: forms,
  });
});

exports.assosiateTypeTask = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    idTask: Joi.number().integer().required(),
    forms: Joi.array().items(
      Joi.object({
        idForm: Joi.number().integer().required(),
        isRequired: Joi.boolean().required(),
      })
    ),
    idUser: Joi.string().required(),
  });
  const validate = schema.validate(req.body);
  if (validate.error) {
    throw validate.error;
  }
  await formModel.associateTypeTask(req.body, req.userLoged);
  res.status(201).json({
    status: 201,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: req.body,
  });
});

exports.editFormsByTask = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    form: Joi.object({
      idForm: Joi.number().integer().required(),
      isRequired: Joi.boolean().required(),
    }),
    idUser: Joi.string().required(),
  });
  const validate = schema.validate(req.body);
  if (validate.error) {
    throw validate.error;
  }
  req.body.idTask = req.params.idTask * 1;
  await formModel.updateAssociateTypeTask(
    req.params.idTask,
    req.body,
    req.userLoged
  );
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: req.body,
  });
});

exports.deleteFormsByTask = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    idTask: Joi.number().integer().required(),
    idForm: Joi.number().integer().required(),
  });
  const validate = schema.validate(req.params);
  if (validate.error) {
    throw validate.error;
  }
  await formModel.deleteAssociateTypeTask(req.params);
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: {},
  });
});
