const Joi = require('@hapi/joi');

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
