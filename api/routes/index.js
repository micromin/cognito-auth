var express = require('express');
var router = express.Router();

const authController = require('../controllers/auth');


// authentication
router.post('/signup', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.isAuthorized, authController.logout);
router.post('/confirmUser', authController.confirmUser);
router.post('/resendVerificationCode', authController.resendVerificationCode);
router.post('/validateToken', authController.validateToken);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/resetPassword', authController.resetPassword);

module.exports = router;