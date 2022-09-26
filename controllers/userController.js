const User = require("../models/users");
const Job = require("../models/jobs");

const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken");
const fs = require("fs");

const APIFilters = require('../utils/apiFilters');

//Get current user profile => /api/v1/me

exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: "jobPublished",
    select: "title postingDate",
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// Update current user Password. => api/v1/password/change

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  //check previous user password. =>

  const isMatched = await user.comparePassword(req.body.currentPassword);

  if (!isMatched) {
    return next(new ErrorHandler("Old Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
});

// Update current user data. =>api/v1/me/update

exports.updateUser = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email, //can't change your role.   And for password, we already made above route.
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});



//Show all applied jobs => /api/v1/jobs/applied.

exports.getAppliedJobs = catchAsyncErrors(async (req, res, next) => {
  const jobs = await Job.find({
    "applicationsApplied.id": req.user.id,
  }).select("+applicationsApplied");

  res.status(200).json({
    success: true,
    results: jobs.length,
    data: jobs,
  });
});


// Show all jobs published by employeer   =>   /api/v1/jobs/published
exports.getPublishedJobs = catchAsyncErrors( async (req, res, next) => {
    const jobs = await Job.find({user : req.user.id});

    res.status(200).json({
        success : true,
        results : jobs.length,
        data : jobs
    })
});



// Delete current User. => /api/v1/me/delete
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  deleteUserData(req.user.id, req.user.role);

  const user = await User.findByIdAndDelete(req.user.id);

  res.cookie("token", "none", {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    sucess: true,
    message: "Your account has been deleted successfully",
  });
});


// delete jobs and resume files with this function.
async function deleteUserData(userId, role) {
  if (role === "employer") {
    //then only delete the jobs which he created (published). If he is gone so what the point. So those jobs where his id reference is there => delete those.
    await Job.deleteMany({ user: userId }); // delete all jobs from DB
  }

  if (role === "user") {
    // delete files which he stored as well before deleting its reference from DB

    const appliedJobs = await Job.find({
      "applicationsApplied.id": userId,
    }).select("+applicationsApplied");

    // console.log(appliedJobs, "apapapa");

    //now delete those jobs

    for (let i = 0; i < appliedJobs.length; i++) {
      let obj = appliedJobs[i].applicationsApplied.find((o) => o.id === userId);
console.log(obj, "obj")

      console.log(__dirname);

      let filepath = `${__dirname}/public/uploads/${obj.resume}`.replace(
        `\\controllers`,
        ""
      );  //check the commentary. Basically making path right

      fs.unlink(filepath, (err) => {
        if (err) return console.log(err);
      });

      appliedJobs[i].applicationsApplied.splice(
        appliedJobs[i].applicationsApplied.indexOf(obj.id),
        1
      );

      appliedJobs[i].save(); //save job automatically
    }
  }
}







// Adding controller methods that only accessible by admins

// Show all users  =>   /api/v1/users
exports.getUsers = catchAsyncErrors( async (req, res, next) => {
    const apiFilters = new APIFilters(User.find(), req.query)
        .filter()
        .sort()
        .limitFields()
        .pagination();
        // not added search by query method. 
  
    const users = await apiFilters.query; // .query method didn't understand. 
  
    res.status(200).json({
        success : true,
        results : users.length,
        data : users
    })
  });
  


  // Delete User(Admin)   =>   /api/v1/user/:id
exports.deleteUserAdmin = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findById(req.params.id); // this time get id from parameter as admin is requesting and req.user is for normal user which is getting attached while authentication. 

    if(!user) {
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`, 404));
    }

    console.log(user, user.id, "check")

    deleteUserData(user.id, user.role);// function call => 
    await user.remove(); // remove user from DB

    res.status(200).json({
        success : true,
        message : 'User is deleted by Admin.'
    });

});