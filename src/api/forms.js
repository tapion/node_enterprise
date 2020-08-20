const express = require('express');
const formService = require('../services/formsService');

const router = express.Router();

router.route('/task-types').post(formService.assosiateTypeTask);
router
  .route('/task-types/:idTask')
  .get(formService.validateTaskId, formService.getFormsByTask)
  .put(formService.validateTaskId, formService.editFormsByTask);

router
  .route('/')
  .post(formService.validateForm, formService.create)
  .get(formService.getAll);
router.route('/:formId').get(formService.getForm);

module.exports = router;
