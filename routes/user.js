const express= require('express');
const router= express.Router();

const {getUserProfile, updatePassword, updateUser, deleteUser, getAppliedJobs, getPublishedJobs} = require("../controllers/userController")

const {isAuthenticated, authorizeRoles} = require("../middlewares/auth");

router.route("/me").get(isAuthenticated, getUserProfile);   // if authenticated will not be written it will throw error, can not read the property of undefined becz in authentication only we are attaching userid. 
router.route("/jobs/applied").get(isAuthenticated, authorizeRoles("user"), getAppliedJobs) //// only user can see his applied jobs

router.route("/jobs/published").get(isAuthenticated, authorizeRoles("employer", "admin"), getPublishedJobs) // only employer or admin can see his created jobs

router.route("/password/update").put(isAuthenticated, updatePassword)
router.route("/me/update").put(isAuthenticated, updateUser)

router.route("/me/delete").delete(isAuthenticated, deleteUser)


module.exports = router;