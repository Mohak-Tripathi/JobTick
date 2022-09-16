const mongoose= require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({

    name : {
        type : String,
        required : [true, "Please enter your name"]
    },
    email : {
        type: String,
        required : [true, "Please enter your email address"],
        unique : true,
        validate : [validator.isEmail, "Please enter valid email address"]
    },
    role: {
        type: String,
        enum: {
            values: ["user", "employer"],   //user is normal user who is applying for role and employer we know. But there is 3rd one and i.e. "Admin" but we do that direstly in database. We can not just let user to select the same. 
            message: "Please enter your role"
        }, 
        default: "user"
    },
    password: {
        type: String,
        required: [true, "Please enter a password"],
        minlength: [8, "Your password must be at least 8 characters long"],
        select: false, //becz don't want to show to normal user
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date

})


module.exports = mongoose.model("User", userSchema);