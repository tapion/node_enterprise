const menuModel = require('../models/menuOptionsModel');
const wrapAsyncFn = require('../utils/wrapAsyncFunction');
const AppError = require('../utils/appError');

const validateHasOptions = (opc) => {
    let hasChildren = false;
    opc.forEach(opc1 => {
      if(opc1.menuSections === undefined){
        hasChildren = (!hasChildren && (opc1.path) && opc1.path.length > 1) ? true : hasChildren;
      }else{
        hasChildren = !hasChildren && validateHasOptions(opc1.menuSections) ? true : hasChildren;
      }
    })
    return hasChildren;
}

exports.getAllOptionsAsigned = wrapAsyncFn(async (req,res) => {  
  const menuOptions = await menuModel.getAllMenuOptions(null,req.userLoged.roles.join(','));
  if(menuOptions === undefined){
    throw new AppError(`Not found options for roles ${req.userLoged.roles.join(',')}, check all the menuoptions tree`,200);
  }
  const result = menuOptions.filter(opc => opc.menuSections !== undefined && validateHasOptions(opc.menuSections));
  res.status(200).json({
    status: 200,
    message: 'lbl_resp_succes',
    rowAffected: result ? result.length : 0,
    serverTime: Date.now(),
    data: result || {},
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
