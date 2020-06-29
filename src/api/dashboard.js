const express = require('express');
const dashBoardService = require('../services/dashBoardServices');

const router = express.Router();

router.route('/:initDate/:finDate').get(dashBoardService.dashBoardInformation);

module.exports = router;
