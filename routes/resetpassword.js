const resetpasswordController = require('../controller/resetpassword');

const express = require('express');
const router = express.Router();

router.get('/updatepassword/:resetpasswordid', resetpasswordController.updatepassword)

router.get('/resetpassword/:id', resetpasswordController.resetpassword)

router.use('/forgotpassword', resetpasswordController.forgotpassword)

module.exports = router;