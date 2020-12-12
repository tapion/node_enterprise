const express = require('express');
const templatesService = require('../services/templatesService');

const router = express.Router();

router.route('/')
    .get(templatesService.getAllTemplates)
    .post(templatesService.templateDataValidation,templatesService.saveTemplate);

router.route('/:idTemplate')
    .get(templatesService.validaCostumerIdParam, templatesService.getTemplatesById)
    .delete(templatesService.validaCostumerIdParam, templatesService.deleteTemplate)
    .put(templatesService.templateDataValidation,templatesService.validaCostumerIdParam, templatesService.updateTemplate);

module.exports = router;
