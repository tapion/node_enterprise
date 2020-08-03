const express = require('express');
const formService = require('../services/formsService');

const router = express.Router();

router.route('/').post(formService.create);
router.route('/:formId').get(formService.getForm);

module.exports = router;
