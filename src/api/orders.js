const express = require('express');
const ordersService = require('../services/ordersService');

const router = express.Router();

router.route('/type-task').post(ordersService.saveTypeOrderAndTask);
router
  .route('/type-task/:idTypeOrder')
  .put(ordersService.validateTypeOrder, ordersService.updateTypeOrderAndTask)
  .get(ordersService.validateTypeOrder, ordersService.getAllTypeOrderAndTask);
router
  .route('/type-task/:idTypeOrder/:idTask')
  .delete(ordersService.deleteTypeOrderAndTask);

module.exports = router;
