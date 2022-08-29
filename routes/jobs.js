const express= require('express');
const router= express.Router();

// router.get('/jobs', (req, res) =>{
//     res.status(200).json({mesg: "Jobs"})
// })


// import jobController 
const {getJobs, newJob}= require('../controllers/jobsController')

router.route('/jobs').get(getJobs)
router.route("/job/new").post(newJob)


module.exports = router;
