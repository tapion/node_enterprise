const express = require('express');
const formService = require('../services/formsService');

const router = express.Router();

router.route('/task-types').post(formService.asosiateTypeTask);

router
  .route('/')
  .post(formService.validateForm, formService.create)
  .get(formService.getAll);
router.route('/:formId').get(formService.getForm);

module.exports = router;
