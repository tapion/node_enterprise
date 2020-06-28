const express = require('express');
const notificationService = require('../services/notificationsService');

const router = express.Router();

router.route('/').put(notificationService.addNotification);
router.route('/:notificationId').get(notificationService.getNotification);

module.exports = router;
