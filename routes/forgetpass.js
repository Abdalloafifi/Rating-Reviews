var express = require('express');
var router = express.Router();
const { sendResetPasswordEmail, validateResetPasswordCode, resetPassword } = require("../controllers/forgetpassword");



router.post("/reset-password", sendResetPasswordEmail);
router.post("/validate-code", validateResetPasswordCode);
router.post("/update-password", resetPassword);



module.exports = router;
