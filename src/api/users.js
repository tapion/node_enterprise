const express = require('express');
const userService = require('../services/usersService');

const router = express.Router();

router.route('/')
    .post(userService.validateUserBody,userService.saveUser)
    .get(userService.getAllUsers);
router.route('/:userId/password')
    .put(userService.validateUserId,userService.updatePassword);
router.route('/:userId')
    .put(userService.validateUserId,userService.validateUserBody,userService.updateUser)
    .delete(userService.validateUserId,userService.deleteUserById)
    .get(userService.validateUserId,userService.getUserById);

module.exports = router;
