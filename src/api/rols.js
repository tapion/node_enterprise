const express = require('express');
const rolsService = require('../services/rolsService');

const router = express.Router();

router.route('/:roleId/permissions').get(rolsService.getPermissions);
router.route('/')
    .post(rolsService.validateRolBody,rolsService.insertRol)
    .get(rolsService.getAllRol);
router.route('/:roleId')
    .put(rolsService.validateRolId,rolsService.validateRolBody, rolsService.updateRolById)
    .delete(rolsService.validateRolId, rolsService.deleteRolById)
    .get(rolsService.validateRolId, rolsService.getRolById);
module.exports = router;
