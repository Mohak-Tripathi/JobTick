const express= require('express');
const router= express.Router();

const {getUserProfile} = require("../controllers/userController")

const {isAuthenticated} = require("../middlewares/auth");

router.route("/me").get(isAuthenticated, getUserProfile);

module.exports = router;