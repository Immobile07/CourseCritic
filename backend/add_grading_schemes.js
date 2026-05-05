const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('./models/Course.model');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Adding grading schemes to existing courses...');
    
    const courses = await Course.find();
    let count = 0;
    
    for (const course of courses) {
      // Modifying the title slightly triggers the pre('save') hook, then we put it back
      const originalTitle = course.title;
      course.title = originalTitle + ' ';
      await course.save();
      
      course.title = originalTitle;
      await course.save();
      count++;
    }
    
    console.log(`Successfully added grading outlines to ${count} courses!`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });