const express = require('express');
const clientService = require('../services/clientsService');

const router = express.Router();

router
  .route('/')
  .post(clientService.createAndupdateValidations, clientService.createClients)
  .get(clientService.getClients);
router
  .route('/:idCustomer')
  .get(clientService.validaCostumerIdParam, clientService.getCustomerById)
  .put(
    clientService.validaCostumerIdParam,
    clientService.createAndupdateValidations,
    clientService.updateCustomer
  )
  .delete(clientService.validaCostumerIdParam, clientService.deleteCustomer);
module.exports = router;
