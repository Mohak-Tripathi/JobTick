const express= require('express');
const router= express.Router();

// router.get('/jobs', (req, res) =>{
//     res.status(200).json({mesg: "Jobs"})
// })


// import jobController 
const {getJobs, newJob, getJobsInRadius, updateJob, deleteJob, getJob, jobStats, applyJob}= require('../controllers/jobsController')

const {isAuthenticated, authorizeRoles}= require('../middlewares/auth')

router.route('/jobs').get(getJobs);
router.route("/job/:id/:slug").get(getJob);
router.route("/stats/:topic").get(jobStats);
router.route("/jobs/:zipcode/:distance").get(getJobsInRadius)

// isAuthenticated, authorizeRoles("employer", "admin")
router.route("/job/new").post(newJob) //now protected route

router.route("/job/:id/apply").put(isAuthenticated, authorizeRoles("user"), applyJob) // only user can apply for job

//Note= authentication and authorization order matter a lot. Because in isAuthenticated only => we are attaching "req.user" 
//and also authentication happends before authorization. 

// get and delete methods are in same as route is same
router.route("/job/:id").put(isAuthenticated, authorizeRoles("employer", "admin"), updateJob).delete(isAuthenticated, authorizeRoles("employer", "admin"), deleteJob)





module.exports = router;
