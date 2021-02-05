const express = require('express');
const dashBoardService = require('../services/dashBoardServices');

const router = express.Router();

router.route('/:initialDate/:finalDate').get(dashBoardService.dashBoardInformation);

module.exports = router;
