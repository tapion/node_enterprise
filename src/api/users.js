const express = require('express');
const userService = require('../services/usersService');

const router = express.Router();

router.route('/:userId/notifications').get(userService.getNotificationsByUser);

module.exports = router;
