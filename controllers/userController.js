const User = require("../models/users");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwtToken")

//Get current user profile => /api/v1/me 

exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {

    const user = User.findById(req.user.id); 

    res.status(200).json({
        success: true,
        data: user
    })
})


// Update current user Password. => api/v1/password/change

exports.updatePassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password");
    
    //check previous user password. =>

    const isMatched = await user.comparePassword(req.body.currentPassword);

    if(!isMatched) {
        return next(new ErrorHandler("Old Password is incorrect", 401))
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user, 200, res);


})