const Job = require("../models/jobs");

const geoCoder = require("../utils/geocoder");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const APIFilters = require("../utils/apiFilters");
const path = require("path");

//GET ALL JOBS=> /api/v1/jobs
exports.getJobs = catchAsyncErrors(async (req, res, next) => {
  const apiFilters = new APIFilters(Job.find(), req.query) //   const apiFilters = new APIFilters(Job, req.query) => Job.find() and only Job both will work and only "Job" is making more sense here.
    //now you can do -
    .filter() // similar to apiFilters.filter()
    .sort() // similar to apiFilters.sort()
    .limitFields() // similar to apiFilters.limitFields()
    .searchByQuery() // similar to apiFilters.searchByQuery()
    .pagination(); // similar to apiFilters.pagination()

  // const jobs = await Job.find({}).lean().exec();

  const jobs = await apiFilters.query; // Why we added ".query" here?

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
});

//Create a new Job => /api/v1/job/new
// User must be authenticated and must be employer  (Later we will do)

exports.newJob = catchAsyncErrors(async (req, res, next) => {
  //   console.log(req.body);

  //Adding user to body.
  req.body.user = req.user.id;

  //req.user holds the currently logged in user data.
  // So, req.user.id will give the current user ID.
  //We just assign this id to req.body and saving that in the database.
  //In the jobs model, we have also specified that we have to save the user ID.
  //And req.user data is coming from the auth.js middleware.

  const job = await Job.create(req.body);

  res.status(200).json({
    success: true,
    message: "Job sucessfully created",
    data: job,
  });

  // here we are supposed to use try catch or ".then or .catch" as we dealing with "promises", but we will take care the same while dealing with "global error handling"
});

//UPDATE NEW jOB => /api/v1/job/:id;

exports.updateJob = catchAsyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  // Better Error handling later.
  // When sending wrong id to check- Don't reduce its size- Id size must be 24 characters.

  // Que- When I give try to update title of job , Slug is not get updated . Could you please check ?
  // For Example if I updated title from ( Node Developer ) to ( Nest Developer ) then I want to expect a result of slug ( nest-developer )
  //Ans-   The reason is that we have used pre-save in the model. There can be multiple solutions:

  //You can define another method in model with pre (update) OR
  //You can simply when you update job rather than using findByIdAndUpdate you can use job.save(). This will automatically call the pre-save method and generate the slug.

  // So basically learn how mongoose middleware work.
  if (!job) {
    // return res.status(404).json({
    //   success: false,
    //   message: "Job not Found",
    // });

    return next(new ErrorHandler("Job not found", 404));
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
});

//Delete a Job= > /api/v1/job/:id;

//Someone asked good question- Chapter 37 - Regarding job update
exports.deleteJob = catchAsyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    // return se immediately, it will come out from function

    // return res.status(404).json({
    //   success: false,
    //   message: "Job not found",
    // });

    return next(new ErrorHandler("Job not found", 404));
  }

  //Job.remove(); will also woek
  job = await Job.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Jobs deleted suceesfully",
  });
});

// Get a single job with id and slug => /api/v1/job/:id/:slug

exports.getJob = catchAsyncErrors(async function (req, res, next) {
  //   let job = await Job.findById(req.params.id);
  // Earlier line is not proper as we need "id" and "slug" both so -----

  let job = await Job.find({
    $and: [{ _id: req.params.id }, { slug: req.params.slug }],
  });

  if (!job || job.length === 0) {
    // return res.status(404).json({
    //   success: false,
    //   message: "Job not found",
    // });
    return next(new ErrorHandler("Job not found", 404));
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
});

//Get statistics about a topic/title(job) => /api/v1/stats/:topic  => topic here means title only

exports.jobStats = catchAsyncErrors(async (req, res, next) => {
  const stats = await Job.aggregate([
    {
      //syntax-- so match -> what ? => text => but How? => through search
      $match: { $text: { $search: '"' + req.params.topic + '"' } },
    },
    {
      // this is critical so we are grouping on the basis of id- => id is very important=> if id is null=> then it will finad totalJobs, avgPosition, min, max salary etc of all the documents mentioned but if you put the criteria as well in "_id"- so it will create different groups as well.
      // so "No experience" data with all these key points (min and max salary etc). Similarly -> 2-5 years ka and 5+ years ka as well. "

      // You also need to run "createIndex command in mongoShell"
      //db.jobs.createIndex({title : "text"}) - otherwise it won't work

      $group: {
        _id: { $toUpper: `$experience` }, //syntax
        totalJobs: { $sum: 1 },
        avgPosition: { $avg: `$positions` },
        avgSalary: { $avg: `$salary` },
        minSalary: { $min: `$salary` },
        maxSalary: { $max: `$salary` },
      },
      // basically match ex- Node developer and then group then and find their salary
    },
  ]);

  if (stats.length === 0) {
    return next(
      new ErrorHandler(`No stats found for - ${req.params.topic}`, 200)
    );

    // return res.status(200).json({
    //   success: false,
    //   message: `No stats found for - ${req.params.topic}`,
    // });
  }

  return res.status(200).json({
    success: true,
    data: stats,
  });
});

//Search jobs with radius => /api/v1/jobs/:zipcode/:distance

exports.getJobsInRadius = catchAsyncErrors(async (req, res, next) => {
  const { zipcode, distance } = req.params;

  // geocoder will provide latitude and longitude from zipcode => So import geocoder

  const loc = await geoCoder.geocode(zipcode);

  const latitude = loc[0].latitude;
  const longitude = loc[0].longitude;

  const radius = distance / 3963; // 3963 will radius of earth

  //Specific MongoDB query -
  //Search in your Database. centerSphere is inbuilt operator.
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
});

//Apply to job using Resume => /api/v1/job/:id/apply.

exports.applyJob = catchAsyncErrors(async (req, res, next) => {
  let job = await Job.findById(req.params.id);

  if (!job) {
    return next(new ErrorHandler("Job not found", 404));
  }

  //Check that if job last date has been passed or not.

  if (job.lastDate < new Date(Date.now())) {
    return next(
      new ErrorHandler("You cannot apply to this job. Date is over, 400 ")
    );
  }

  //Check the files.
  //We have middleware applied in app.js. That is how we check and get file here.
  if (!req.files) {
    return next(new ErrorHandler("Please upload files", 400));
  }

  const file = req.files.file;

  // Check file type.
  const supportedFiles = /.docs|.pdf/;

  //use test() method
  if (!supportedFiles.test(path.extname(file.name))) {
    return next(new ErrorHandler("Please upload pdf or doc file", 400));
  }

  // Check document size.
  if (file.size > process.env.Max_File_Size) {
    return next(
      new ErrorHandler("Document size should be less than 2MB.", 400)
    );
  }

  //Renaming resume=> Aim is to make it unique. So replacing user name space(" ") with underscore. then adding jobid then file name with its extension.

  file.name = `${req.user.name.replace(" ", "_")}_${job._id}${
    path.parse(file.name).ext
  }`;
});

//mv method is used to move the files

file.mv(`${process.env.UPLOAD_PATH}/${file.name}`, async (err) => {
  if (err) {
    console.log(err);
    return next(new ErrorHandler("Resume Upload failed", 500));
  }

  //file if moved. We are just storing details in "applicantsApplied" field. (not file itself. Just recheck)
  await Job.findByIdAndUpdate(
    req.params.id,
    {
      //job model has applicantsApplied field. which is array to object. So push object inside array.
      $push: {
        applicantsApplied: {
          id: req.user.id,
          resume: file.name,
        }, //original files will be stored in file system separetly.
      },
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );
});

res.status(200).json({
  sucess: true,
  message: "Applied to job successfully",
  data: file.name,
});
