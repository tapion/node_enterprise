const express = require('express');
const workFlowService = require('../services/workFlowsService');

const router = express.Router();

router.route('/').get(workFlowService.getWorkFlows);
router.route('/:workOrder/forms').get(workFlowService.getFormsBysWorkOrder);

module.exports = router;
