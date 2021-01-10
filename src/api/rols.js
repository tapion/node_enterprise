const express = require('express');
const rolsService = require('../services/rolsService');

const router = express.Router();

router.route('/:roleId/permissions').get(rolsService.getPermissions);
router.route('/')
    .post(rolsService.insertRol)
    .get(rolsService.getAllRol);
router.route('/:roleId')
    .put(rolsService.validateRolId, rolsService.updateRolById)
    .delete(rolsService.validateRolId, rolsService.deleteRolById)
    .get(rolsService.validateRolId, rolsService.getRolById);
module.exports = router;
