class APIFilters {
    constructor(query, queryStr) {
      this.query = query; // Ex- Job.find()
      this.queryStr = queryStr; //Ex- {jobType: "Permanent"}
    }
  
    // filter(){  //method name (Any name)
    //     this.query = this.query.find(this.queryStr)   //Job.find({"jobType": "Permanent"})
    //     return this; // return the object
    // }
  
    //Advance version of filter method to cater Advance filter
  
    filter() {
      //method name (Any name)
  
      const queryCopy = { ...this.queryStr }; // if more then one filter i think therefore, we made copy
  
    //   Removing fields from the query -
  
      const removeFields = ["sort","fields", "q"];
      removeFields.forEach(el => delete queryCopy[el]);
      console.log(queryCopy);
  
      // Advance filter using : lt, lte, gt, gte, in
  
      let queryStr = JSON.stringify(queryCopy);
      queryStr = queryStr.replace(
        // if you find gt, gte etc then replace otherwise let it pass. For example- {"jobType": "Permanent"} => so no need
        /\b(gt|gte|lt|lte|in)\b/g,
        (match) => `$${match}`
      );
      // console.log(queryStr);
  
      this.query = this.query.find(JSON.parse(queryStr)); //Job.find({"jobType": "Permanent"})
      return this; // return the object
    }
  
    sort() {
      if (this.queryStr.sort) {
        // this.query = this.query.sort(this.queryStr.sort) // little chnge needed if we want to sort with multiple fields
  
        const sortBy = this.queryStr.sort.split(",").join(" ");
        this.query = this.query.sort(sortBy);
        // console.log(sortBy)
        // console.log(this.query)
  
        //now it means if => sort = salary, jobType then sorting will happen as per salary but if two documents with same salary comes,
        // then jobType will come into picture.
      } else {
        this.query = this.query.sort("-postingDate"); // if no sorting applied, then I want data comes as per postingDate but in decreasing order (Latest)
      }
      return this; // return the object
    }
  
    limitFields() {
      if (this.queryStr.fields) {
        const fields = this.queryStr.fields.split(",").join(" ");
        this.query = this.query.select(fields);
      }
      return this;
    }
  
    searchByQuery() {
      if (this.queryStr.q) {
        const qu = this.queryStr.q.split("-").join(" "); // - and not "," becz in URL => q= Java-developer hota hai. In URL we don't give space.
        this.query = this.query.find({ $text: { $search: '"' + qu + '"' } }); // finding specific query in title.
      }
      return this;
    }
  
    //pagination
  
    pagination() {
      const page = parseInt(this.queryStr.page, 10) || 1; // here base is 10 for pareInt
      const limit = parseInt(this.queryStr.limit, 10) || 10;
      const skipResult = (page - 1) * limit;
  
      this.query = this.query.skip(skipResult).limit(limit);
  
      return this;
    }
  }
  
  module.exports = APIFilters;
  