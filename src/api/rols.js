const express = require('express');
const rolsService = require('../services/rolsService');

const router = express.Router();

router.route('/:roleId/permissions').get(rolsService.getPermissions);

module.exports = router;
