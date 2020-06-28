const express = require('express');
const clientService = require('../services/clientsService');

const router = express.Router();

router.route('/').get(clientService.getClients);

module.exports = router;
