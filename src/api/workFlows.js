const express = require('express');
const workFlowService = require('../services/workFlowsService');

const router = express.Router();

router.route('/').get(workFlowService.getWorkFlows);

module.exports = router;
