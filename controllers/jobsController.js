const Job = require("../models/jobs")


//GET ALL JOBS=> /api/v1/jobs
exports.getJobs= (req, res, next) =>{
    res.status(200).json({
        success: true,
        middlewareUser: req.user,
        middlewareMethod: req.method,
        middlewareURLInTrueSense: req.middlewareURL,
        message: 'Job total list'
    })
}

//Create a new Job => /api/v1/job/new
exports.newJob = async (req, res, next) => {
    
console.log(req.body)

    const job = await Job.create(req.body);

    res.status(200).json({
        success: true,
        message: "Job sucessfully created",
        data: job    
    })

    // here we are supposed to use try catch or ".then or .catch" as we dealing with "promises", but we will take care the same while dealing with "global error handling" 
}