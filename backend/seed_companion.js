const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User.model');
const Course = require('./models/Course.model');
const Review = require('./models/Review.model');
const Professor = require('./models/Professor.model');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Adding companion review...');
    
    // Get the first two courses
    const courses = await Course.find().limit(2);
    if (courses.length < 2) {
      console.log('Not enough courses to create a companion link.');
      process.exit(0);
    }
    
    const course1 = courses[0];
    const course2 = courses[1];
    
    // Find a user who reviewed course 1
    const review1 = await Review.findOne({ course: course1._id });
    if (!review1) {
      console.log('No reviews found for course 1, cannot create companion.');
      process.exit(0);
    }
    
    const userId = review1.author;
    
    // Get a professor for course 2
    const profId = course2.taughtBy.length > 0 ? course2.taughtBy[0] : (await Professor.findOne())._id;
    
    // Check if user already reviewed course 2
    const existingReview = await Review.findOne({ course: course2._id, author: userId });
    
    if (!existingReview) {
      await Review.create({
        course: course2._id,
        professor: profId,
        author: userId,
        difficultyRating: 3,
        usefulnessRating: 4,
        workloadRating: 3,
        writtenFeedback: 'Great companion course!',
        isAnonymous: false
      });
      console.log(`Successfully added a review for ${course2.courseCode} by the same user who took ${course1.courseCode}!`);
      console.log(`If you visit the page for ${course1.courseCode}, you should now see ${course2.courseCode} as a companion.`);
      console.log(`If you visit the page for ${course2.courseCode}, you should now see ${course1.courseCode} as a companion.`);
    } else {
      console.log('Companion review already exists.');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
