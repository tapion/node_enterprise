const express = require('express');
const operatorService = require('../services/operatorsService');

const router = express.Router();

router.route('/:operatorId/workOrders').get(operatorService.workOrders);
router.route('/').get(operatorService.getAllOperators);
router.route('/locations').get(operatorService.getLocations);

module.exports = router;
