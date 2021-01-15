const express = require('express');
const menuOptionService = require('../services/menuOptionsService');

const router = express.Router();

router.route('/').get(menuOptionService.getAllOptionsAsigned);
router.route('/options/').get(menuOptionService.getAllOptionsAsignedWithoutPath);

module.exports = router;
