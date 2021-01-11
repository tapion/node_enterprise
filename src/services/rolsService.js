const Joi = require('@hapi/joi');
const rolModel = require('../models/rolModel');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');
const AppError = require('../utils/appError');


exports.getPermissions = (req, res) => {
  try {
    const shema = Joi.object({
      roleId: Joi.number().integer().min(1),
    });
    const validate = shema.validate(req.params);
    if (validate.error) {
      throw validate.error;
    }
    res.status(200).json({
      status: 'success',
      serverTime: Date.now(),
      data: [
        {
          id: 1,
          webType: true,
          level: 1,
          icon: 'allow',
          label: 'Create WorkOrder',
          resourceAdress: '/operators/:number/workOrders',
          childrenArray: [
            {
              id: 2,
              webType: true,
              level: 1,
              icon: 'delete',
              label: 'Elminar WorkOrder',
              resourceAdress: '/workOrders/:number',
              childrenArray: [null],
            },
          ],
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

exports.getAllRol = wrapAsyncFn(async (req,res,next) => {
  const recorsetForms = await rolModel.getAllRoles();
  if (recorsetForms.rowCount === 0) {
    throw new AppError(
      `Not found Roles`,
      200
    );
  }
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    transaccionId: recorsetForms.rowCount,
    serverTime: Date.now(),
    data: recorsetForms.rows,
  });

});

exports.insertRol = wrapAsyncFn(async (req,res) => {
  const schema = Joi.object({
    roleId: Joi.number().integer().allow(null).empty(''),
    roleName: Joi.string().min(5).required(),
    roleDescription: Joi.string().min(5).required(),
    active: Joi.boolean().required()
  });
  const validate = schema.validate(req.body);
  if (validate.error) {
    throw validate.error;
  }
  const recorsetSaveRole = await rolModel.saveRol(req.body, req.userLoged);
  res.status(201).json({
    status: 201,
    message: 'lbl_resp_succes',
    transaccionId: recorsetSaveRole.rowCount,
    serverTime: Date.now(),
    data: {...req.body, roleId: recorsetSaveRole.rows[0].id},
  });
});

exports.getRolById = wrapAsyncFn(async (req,res) => {
  const recorsetSaveRole = await rolModel.getRolById(req.params.roleId);
  let message = 'lbl_resp_succes';
  if (recorsetSaveRole.rowCount === 0) {
    message = 'lbl_resp_404';
    recorsetSaveRole.rows[0] = {};
  }
  res.status(200).json({
    status: 200,
    message,
    transaccionId: recorsetSaveRole.rowCount,
    serverTime: Date.now(),
    data: recorsetSaveRole.rows[0],
  });
});

exports.validateRolId = wrapAsyncFn(async (req,res,next) => {
  const schema = Joi.object({
    roleId: Joi.number().integer().min(1)
  });
  const validate = schema.validate(req.params);
  if (validate.error) {
    next(validate.error);
  }
  next();
});

exports.updateRolById = wrapAsyncFn(async (req,res) => {  
  let message = 'lbl_resp_succes';
  const schema = Joi.object({
    roleId: Joi.number().integer().allow(null).empty(''),
    roleName: Joi.string().min(5).required(),
    roleDescription: Joi.string().min(5).required(),
    active: Joi.boolean().required()
  });
  const validate = schema.validate(req.body);
  if (validate.error) {
    throw validate.error;
  }
  const recorsetSaveRole = await rolModel.updateRolById(req.params.roleId,req.body, req.userLoged);
  if (recorsetSaveRole.rowCount === 0) {
    message = 'lbl_resp_404';
    recorsetSaveRole.rows[0] = {};
  }  
  res.status(200).json({
    status: 200,
    message,
    transaccionId: recorsetSaveRole.rowCount,
    serverTime: Date.now(),
    data: {roleId: req.params.roleId,...req.body},
  });
});

exports.deleteRolById = wrapAsyncFn(async (req,res) => {  
  const recorsetSaveRole = await rolModel.deleteRolById(req.params.roleId,req.userLoged);
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    transaccionId: recorsetSaveRole.rowCount,
    serverTime: Date.now(),
    data: {},
  });
});
