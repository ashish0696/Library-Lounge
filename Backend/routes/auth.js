const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateLogin } = require('../validation/auth.validation');

router.post('/login', validateLogin, authController.loginUser);

module.exports = router;