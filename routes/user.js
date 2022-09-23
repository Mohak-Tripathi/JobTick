const express= require('express');
const router= express.Router();

const {getUserProfile, updatePassword, updateUser, deleteUser, getAppliedJobs, getPublishedJobs, getUsers, deleteUserAdmin} = require("../controllers/userController")

const {isAuthenticated, authorizeRoles} = require("../middlewares/auth");

router.use(isAuthenticated) // becz we were using isAuthenticated in every route. So we used use. And remove "isAuthenticated" from every route"

router.route("/me").get(getUserProfile);   // if authenticated will not be written it will throw error, can not read the property of undefined becz in authentication only we are attaching userid. 
router.route("/jobs/applied").get(authorizeRoles("user"), getAppliedJobs) //// only user can see his applied jobs

router.route("/jobs/published").get(authorizeRoles("employer", "admin"), getPublishedJobs) // only employer or admin can see his created jobs

router.route("/password/update").put(updatePassword)
router.route("/me/update").put(updateUser)

router.route("/me/delete").delete(deleteUser)

//only admin Routes

router.route("/users").get(isAuthenticated, authorizeRoles("admin"), getUsers)

router.route("/user/:id").get(isAuthenticated, authorizeRoles("admin"), deleteUserAdmin)


module.exports = router;