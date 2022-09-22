const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");

const geoCoder= require("../utils/geocoder")


const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please enter Job Title"],
      trim: true, // remove blank spaces
      maxlength: [100, "Job title cannot exceed 100 characters"],
    },
    slug: String, // slug is basically a URL, we will create this with "slugify" package.
    description: {
      type: String,
      required: [true, "Please provide Job description"],
      trim: true,
      maxlength: [1000, "Job description cannot exceed 1000 characters"],
    },
    email: {
      // company email so that employee can contact
      type: String,
      validate: [validator.isEmail, "Please add a valid email address"],
    },
    address: {
      type: String,
      required: [true, "Please enter a valid address"],
    },
    //we will generate location- longitude or lattitude, zip code etc as per the "address" user will provide.
     // We will add "location" entry through package, so not writing right now as user won't provide this.  (this thing done)
    location: {
      type: {
        type: String,
        enum: ["Point"]
      },
      coordinates: {
        type: [Number],   // latitude and longitude are two numbers therefore, array of Number
        index: "2dsphere"
      },
      // this structure is important becz "GeoCoder" package works in this way only. 

      //Now write values which you need- 
      formattedAddress: String, 
      city: String, 
      state: String, 
      zipcode: String, 
      country: String 

    },
    company: {
      type: String,
      required: [true, "Please add comapny name"],
    },
    industry: {
      type: [String], //Array of values
      required: [true, "Please enter industry for this job"],
      enum: {
        values: [
          "Business",
          "Information Technology",
          "Banking",
          "Education/ Training",
          "Telecommunication",
          "Others",
        ],
        message: "Please select correct options for industry.",
      },
    },
    jobType: {
      type: String, // Why here not array of String. Reason is "industry" can operate in different sectors for example- Banking and Business but
      //jobTypes can be one type only- Permanent, temporary or internship
      required: [true, "Please enter the jobType"], 
      enum: {
        values: ["Permanent", "Temporary", "Internship"],
        message: "Please select correct options for job type.",
      },
    },
    minEducation: {
      type: String,
      required: [true, "Please enter the minimum Education"],
      enum: {
        values: ["Bachelors", "Masters", "Phd"],
        message: "Please select correct options for minimum Education",
      },
    },
    positions: {
      type: Number,
      default: 1,
    },
    experience: {
      type: String,
      required: [true, "Please enter the number of experience required"],
      enum: {
        values: [
          "No Experience",
          "1 Year- 2 Year",
          "2 Year- 5 Year",
          "5 Year+",
        ],
        message: "Please select correct options for experience period",
      },
    },
    // salary which employer is ready to pay.
    salary: {
      type: Number,
      required: [true, "Please enter the expected salary for this job"],
    },
    postingDate: {
      type: Date,
      default: Date.now, // OR Date.now()
    },
    lastDate: {
      type: Date,
      default: new Date().setDate(new Date().getDate() + 7),
    },

    //we also want to store the applications applied. We will store their id and resume of those applications.
  //should be applicantsApplied but written wrongly and used wrongly
    applicationsApplied: {
      type: [Object], // Object because we want to store id and resume.
      select: false, // esse normal users can't see this
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    versionKey: false,
    timestamp: true,
  }
);

//Create slug before saving to database => using "pre" (mongoose middleware)

jobSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });

  next();
});

//Setting up Location 

jobSchema.pre("save", async function (next) {

    const loc= await geoCoder.geocode(this.address)  

    // console.log(loc, "mtmtmttm")

    // console.log(loc[0], "ptptptptp")

    this.location = {
        type: "Point",
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress, 
        city: loc[0].city,
        state: loc[0].stateCode, 
        zipcode: loc[0].zipcode, 
        country: loc[0].countryCode



    }

    next();
})




//ye jo update Slug and update location hai, someone asked very good question- As slug and coordinates are depended on
//title and address respectively- if any changes happen in these field- other depended field needs to be changed (Chapter -37)

// For Updating Slug:

jobSchema.pre('findOneAndUpdate', function (next) {
 
  if (this._update.title) {
    this._update.slug = slugify(this._update.title, { lower: true });
  }
 
  next();
});


// For Updating location:
jobSchema.pre('findOneAndUpdate', async function (next) {
 
  if (this._update.address) {
    const loc = await geocoder.geocode(this._update.address);
 
    this._update.location = {
      type: 'Point',
      coordinates: [loc[0].longitude, loc[0].latitude],
      formattedAddress: loc[0].formattedAddress,
      city: loc[0].city,
      state: loc[0].stateCode,
      zipcode: loc[0].zipcode,
      country: loc[0].countryCode
    };
  }
});





//const JOB = mongoose.model("Job", jobSchema);
// module.exports = JOB
// IN 2 LINES YOU CAN DO THAT

module.exports = mongoose.model("Job", jobSchema);

//Our job Schema is ready - 2 things are left "location"  and "User"  => We'll add this after we create User model
