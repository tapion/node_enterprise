const Joi = require('@hapi/joi');
const customerModel = require('../models/clientModel');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');
const AppError = require('../utils/appError');

exports.dashBoardInformation = wrapAsyncFn(async (req, res) => {
  const schema = Joi.object({
    initialDate: Joi.date().max(Joi.ref('finalDate')).required(),
    finalDate: Joi.date().required(),
  });
  const validate = schema.validate(req.params);
  if (validate.error) {
    throw validate.error;
  }
  const {initialDate,finalDate} = req.params;
  const customers = await customerModel.getCustomersByDates(req.params.initialDate,req.params.finalDate);
  const result = await Promise.all(customers.map(async customer => {
    return {
      customer: {
        id: customer.id,
        name: customer.name
      },
      generalReport: {
        totalTasks: customer.totalTask,
        assignedTasks: customer.totalAssigned,
        initializedTasks: customer.totalInitilaced,
        inProgressTasks: customer.totalInProgress,
        closedTasks: customer.totalClosed,
      },
      assignedTasks: await customerModel.getAssignedTasksByCustomerAndStatus(
        customer.id,
        process.env.CTG_TASKS_IN_WORK_ORDER_ASSIGNED,
        initialDate,
        finalDate
      ),
      initializedTasks: await customerModel.getAssignedTasksByCustomerAndStatus(
        customer.id,
        process.env.CTG_TASKS_IN_WORK_ORDER_INITIALIZED,
        initialDate,
        finalDate
      ),
      inProgressTasks: await customerModel.getAssignedTasksByCustomerAndStatus(
        customer.id,
        process.env.CTG_TASKS_IN_WORK_ORDER_INPROCESS,
        initialDate,
        finalDate
      ),
      closedTasks: await customerModel.getAssignedTasksByCustomerAndStatus(
        customer.id,
        process.env.CTG_TASKS_IN_WORK_ORDER_CLOSED,
        initialDate,
        finalDate
      ),
    };
  }));
  res.status(200).json({
    status: 200,
    rowAffected: customers.length,
    message: 'lbl_resp_succes',
    serverTime: Date.now(),
    data: result,
  });
});
