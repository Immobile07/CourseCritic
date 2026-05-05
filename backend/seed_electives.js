const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('./models/Course.model');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Marking some courses as electives...');
    
    // Find all courses
    const courses = await Course.find({});
    
    if (courses.length > 0) {
      // Shuffle the courses array
      const shuffled = courses.sort(() => 0.5 - Math.random());
      
      // Select the first 6 courses to be electives
      const selected = shuffled.slice(0, 6);
      
      for (const course of selected) {
        course.isElective = true;
        await course.save();
      }
      
      console.log('Successfully marked 6 random courses as electives.');
    } else {
      console.log('No courses found in the database.');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
