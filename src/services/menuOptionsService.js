const Joi = require('@hapi/joi');
const menuModel = require('../models/menuOptionsModel');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');
const AppError = require('../utils/appError');

exports.getAllOptionsAsigned = wrapAsyncFn(async (req,res) => {  
  const menuOptions = await menuModel.getAllMenuOptions(null,req.userLoged.roles.join(','));
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    rowAffected: menuOptions.length,
    serverTime: Date.now(),
    data: menuOptions,
  });

});
exports.getAllOptionsAsignedWithoutPath = wrapAsyncFn(async (req,res) => {  
  const menuOptions = await menuModel.getAllOptionsAsignedWithoutPath();
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    rowAffected: menuOptions.length,
    serverTime: Date.now(),
    data: menuOptions,
  });

});
