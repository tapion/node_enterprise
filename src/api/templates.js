const express = require('express');
const templatesService = require('../services/templatesService');

const router = express.Router();

router.route('/').post(templatesService.saveTemplate);

module.exports = router;
