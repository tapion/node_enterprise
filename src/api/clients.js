const express = require('express');
const clientService = require('../services/clientsService');

const router = express.Router();

router
  .route('/')
  .post(clientService.createClients)
  .get(clientService.getClients);
router.route('/:idCustomer').delete(clientService.deleteCustomer);
module.exports = router;
