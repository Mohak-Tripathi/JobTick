const express = require("express")
const router= express.Router(); 

const {registerUser, loginUser, forgotPassword, resetPassword, logout } = require("../controllers/authController")

const {isAuthenticated}= require('../middlewares/auth') // logout functionality should work only for those who are logged in. Therefore, we are using this middleware in logout api mei. 

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)

router.route("/password/forgot").post(forgotPassword)

router.route("/password/reset/:token").put(resetPassword); 

router.route("/logout").get(isAuthenticated, logout); 

module.exports = router
