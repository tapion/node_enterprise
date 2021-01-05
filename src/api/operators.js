const express = require('express');
const operatorService = require('../services/operatorsService');

const router = express.Router();

router.route('/:operatorId/workOrders').get(operatorService.workOrders);
router.route('/tasks').get(operatorService.getTasksByUser);
router.route('/').get(operatorService.getAllOperators);

module.exports = router;
