const express = require('express');
const operatorService = require('../services/operatorsService');

const router = express.Router();

router.route('/:operatorId/workOrders').get(operatorService.workOrders);

module.exports = router;
