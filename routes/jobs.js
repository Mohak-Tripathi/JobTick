const express= require('express');
const router= express.Router();

// router.get('/jobs', (req, res) =>{
//     res.status(200).json({mesg: "Jobs"})
// })


// import jobController 
const {getJobs, newJob, getJobsInRadius, updateJob, deleteJob, getJob, jobStats}= require('../controllers/jobsController')

const {isAuthenticated}= require('../middlewares/auth')

router.route('/jobs').get(getJobs);
router.route("/job/:id/:slug").get(getJob);
router.route("/stats/:topic").get(jobStats);
router.route("/jobs/:zipcode/:distance").get(getJobsInRadius)

router.route("/job/new").post(isAuthenticated, newJob) //now protected route


// get and delete methods are in same as route is same
router.route("/job/:id").put(isAuthenticated, updateJob).delete(isAuthenticated, deleteJob)





module.exports = router;
