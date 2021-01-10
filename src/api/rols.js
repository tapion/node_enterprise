const express = require('express');
const rolsService = require('../services/rolsService');

const router = express.Router();

router.route('/:roleId/permissions').get(rolsService.getPermissions);
router.route('/')
    .post(rolsService.getPermissions)
    .get(rolsService.getAllRol);

module.exports = router;
