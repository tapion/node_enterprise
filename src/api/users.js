const express = require('express');
const userService = require('../services/usersService');

const router = express.Router();

router.route('/').get(userService.getAllUsers);
router.route('/signUp_temp').post(userService.signUp);
router.route('/').get(userService.signUp);
router.route('/refreshToken').post(userService.refreshToken);

module.exports = router;
