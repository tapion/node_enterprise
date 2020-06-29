const express = require('express');
const stateService = require('../services/statesService');

const router = express.Router();

router.route('/').get(stateService.getAllStates);

module.exports = router;
