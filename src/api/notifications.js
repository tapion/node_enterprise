const express = require('express');
const notificationService = require('../services/notificationsService');

const router = express.Router();

router.route('/').put(notificationService.addNotification);

module.exports = router;
