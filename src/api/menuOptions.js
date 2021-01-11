const express = require('express');
const menuOptionService = require('../services/menuOptionsService');

const router = express.Router();

router.route('/').get(menuOptionService.getAllOptionsAsigned);
// router.route('/signUp_temp').post(menuOptionService.signUp);
// router.route('/').get(menuOptionService.signUp);
// router.route('/refreshToken').post(menuOptionService.refreshToken);

module.exports = router;
