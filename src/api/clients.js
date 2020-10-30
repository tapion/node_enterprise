const express = require('express');
const clientService = require('../services/clientsService');

const router = express.Router();

router
  .route('/')
  .post(clientService.createClients)
  .get(clientService.getClients);
router
  .route('/:idCustomer')
  .get(clientService.getCustomerById)
  .delete(clientService.deleteCustomer);
module.exports = router;
