const express = require('express');
const userService = require('../services/usersService');

const router = express.Router();

router.route('/login').post(userService.login);
router.route('/refreshToken').post(userService.refreshToken);

module.exports = router;