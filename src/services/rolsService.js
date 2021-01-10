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
  // const schema = Joi.object({
  //   roleId: Joi.number().integer().allow(null).empty(''),
  //   roleName: Joi.string().min(5).required(),
  //   roleDescription: Joi.string().min(5).required(),
  //   active: Joi.boolean().required(),
  //   creationUser: Joi.string().min(5).required(),
  //   creationDate: Joi.string().min(5).required(),
  //   modificationUser: Joi.string().min(5).required(),
  //   modificationUser: Joi.string().min(5).required(),
  // });
  // const validate = schema.validate(req.params);
  // if (validate.error) {
  //   throw validate.error;
  // }
  const recorsetForms = await rolModel.getAllRoles();
  if (recorsetForms.rowCount === 0) {
    throw new AppError(
      `Not found Roles`,
      200
    );
  }
  console.log(recorsetForms);
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    transaccionId: recorsetForms.rowCount,
    serverTime: Date.now(),
    data: recorsetForms.rows,
  });

});
