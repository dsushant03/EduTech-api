const express = require('express');
const router = express.Router();

const signupController = require('../controller/signupController');

router.post('/signup', signupController);

module.exports = router;