const express = require('express');
const clientService = require('../services/clientsService');

const router = express.Router();

router
  .route('/')
  .post(clientService.createClients)
  .get(clientService.getClients);

module.exports = router;
