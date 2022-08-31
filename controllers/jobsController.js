const Job = require("../models/jobs");

const geoCoder = require("../utils/geocoder");

//GET ALL JOBS=> /api/v1/jobs
exports.getJobs = async (req, res, next) => {
  const jobs = await Job.find({}).lean().exec();

  res.status(200).json({
    success: true,

    //----------------------------------------
    //Just for practice
    // middlewareUser: req.user,
    // middlewareMethod: req.method,
    // middlewareURLInTrueSense: req.middlewareURL,

    //--------------------------------------------
    results: jobs.length,
    data: jobs,
  });
  //   next()
};

//Create a new Job => /api/v1/job/new
// User must be authenticated and must be employer  (Later we will do)

exports.newJob = async (req, res, next) => {
  //   console.log(req.body);

  const job = await Job.create(req.body);

  res.status(200).json({
    success: true,
    message: "Job sucessfully created",
    data: job,
  });

  // here we are supposed to use try catch or ".then or .catch" as we dealing with "promises", but we will take care the same while dealing with "global error handling"
};

//UPDATE NEW jOB => /api/v1/job/:id;

exports.updateJob = async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  // Better Error handling later.
  // When sending wrong id to check- Don't reduce its size- Id size must be 24 characters.

  // Que- When I give try to update title of job , Slug is not get updated . Could you please check ?

  // For Example if I updated title from ( Node Developer ) to ( Nest Developer ) then I want to expect a result of slug ( nest-developer )

  //Ans-   The reason is that we have used pre-save in the model. There can be multiple solutions:

  //You can define another method in model with pre (update) OR

  //You can simply when you update job rather than using findByIdAndUpdate you can use job.save(). This will automatically call the pre-save method and generate the slug.

  if (!job) {
    return res.status(404).json({
      success: false,
      message: "Job not Found",
    });
  }

  job = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  return res.status(200).json({
    success: true,
    message: "Job has been updated",
    data: job,
  });
};

//Delete a Job= > /api/v1/job/:id;

//Someone asked good question- Chapter 37 - Regarding job update
exports.deleteJob = async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    // return se immediately, it will come out from function
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  //Job.remove(); will also woek
  job = await Job.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Jobs deleted suceesfully",
  });
};

// Get a single job with id and slug => /api/v1/job/:id/:slug

exports.getJob = async function (req, res, next) {
  //   let job = await Job.findById(req.params.id);
  // Earlier line is not proper as we need "id" and "slug" both so -----

  let job = await Job.find({
    $and: [{ _id: req.params.id }, { slug: req.params.slug }],
  });

  if (!job || job.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Job not found",
    });
  }

  res.status(200).json({
    success: true,
    data: job,
  });

  //Why is it necessary to have the slug as well as id when implementing the find functionality?
  //Isn't just the id enough for finding and updating a given job?

  //Ans- Yes, ID is enough for finding.
  //You can use only ID I'd you want.
  //I have used slug to show how to make slug and use that.
  //You can find jobs by ID only as ID is always unique.
};

//Get statistics about a topic(job) => /api/v1/stats/:topic

exports.jobStats = async (req, res, next) => {
  const stats = await Job.aggregate([
    {
      //syntax-- so match -> what ? => text => but How? => through search
      $match: { $text: { $search: '"' + req.params.topic + '"' } },
    },
    {
      $group: {
        _id: null, //syntax
        avgSalary: { $avg: "$salary" },
      },
      // basically match ex- Node developer and then group then and find their salary
    },
  ]);

  if (stats.length === 0) {
    return res.status(200).json({
      success: false,
      message: `No stats found for - ${req.params.topic}`,
    });
  }

  return res.status(200).json({
    success: true,
    data: stats,
  });
};

//Search jobs with radius => /api/v1/jobs/:zipcode/:distance

exports.getJobsInRadius = async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // geocoder will provide latitude and longitude from zipcode => So import geocoder

  const loc = await geoCoder.geocode(zipcode);

  const latitude = loc[0].latitude;
  const longitude = loc[0].longitude;

  const radius = distance / 3963; // 3963 will radius of earth

  //Specific MongoDB query -

  const jobs = await Job.find({
    location: {
      $geoWithin: { $centerSphere: [[longitude, latitude], radius] },
    },
  });

  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs,
  });
};
