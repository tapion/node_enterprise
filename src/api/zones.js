const express = require('express');
const zoneService = require('../services/zonesService');

const router = express.Router();

router.route('/').get(zoneService.getAllZones);

module.exports = router;
