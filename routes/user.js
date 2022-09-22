const express= require('express');
const router= express.Router();

const {getUserProfile, updatePassword} = require("../controllers/userController")

const {isAuthenticated} = require("../middlewares/auth");

router.route("/me").get(isAuthenticated, getUserProfile);   // if authenticated will not be written it will throw error, can not read the property of undefined becz in authentication only we are attaching userid. 

router.route("/password/update").put(isAuthenticated, updatePassword)
module.exports = router;