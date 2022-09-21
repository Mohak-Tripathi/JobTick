const User = require("../models/users");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

//Get current user profile => /api/v1/me 

exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {

    const user = User.findById(req.user.id); 

    res.status(200).json({
        success: true,
        data: user
    })
})