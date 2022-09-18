const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const  jwt = require("jsonwebtoken")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email address"],
    unique: true,
    validate: [validator.isEmail, "Please enter valid email address"],
  },
  role: {
    type: String,
    enum: {
      values: ["user", "employer"], //user is normal user who is applying for role and employer we know. But there is 3rd one and i.e. "Admin" but we do that direstly in database. We can not just let user to select the same.
      message: "Please enter your role",
    },
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please enter a password"],
    minlength: [8, "Your password must be at least 8 characters long"],
    select: false, //becz don't want to show to normal user
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

//Encypting password before saving it
userSchema.pre("save", async function (next) {
  //so that "this" can be used
  this.password = await bcrypt.hash(this.password, 10); //saltvalue is 10
});

//Return JSON Web Token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_TIME
  });
};

//Compare user password in database password. 

userSchema.methods.comparePassword = async function(enterPassword){ // password user wrote

    return await bcrypt.compare(enterPassword, this.password) // this.password is that password which is stored in DB.
//this function return true OR false only
}

module.exports = mongoose.model("User", userSchema);
