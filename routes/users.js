var express = require('express');
var router = express.Router();
const { verifyToken } = require('../middlewares/verifytoken');
const {register,verify,login,logout,deleteUser} =require("../controllers/authController")


router.post("/register", register);
router.post("/verify", verify);
router.post("/login", login);
router.post("/logout", logout);
router.delete("/delete", verifyToken, deleteUser);
module.exports = router;
