const express = require('express');
const formService = require('../services/formsService');

const router = express.Router();

router.route('/task-types').post(formService.assosiateTypeTask);
router
  .route('/task-types/:idTask')
  .get(formService.validateTaskId, formService.getFormsByTask)
  .put(formService.validateTaskId, formService.editFormsByTask);
router
  .route('/task-types/:idTask/:idForm')
  .delete(formService.deleteFormsByTask);

router
  .route('/')
  .post(formService.validateForm, formService.create)
  .get(formService.getAll);
router
  .route('/:formId')
  .put(formService.validateForm, formService.updateForm)
  .delete(formService.deleteForm)
  .get(formService.getForm);

module.exports = router;
