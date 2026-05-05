const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User.model');
const Course = require('./models/Course.model');
const Review = require('./models/Review.model');
const Professor = require('./models/Professor.model');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Adding reviews with grades...');
    
    const course = await Course.findOne();
    if (!course) return process.exit(0);
    
    const user = await User.findOne();
    const prof = await Professor.findOne();
    
    const grades = ['A', 'A', 'A', 'B', 'B', 'C', 'F', 'I', 'W'];
    
    for (const g of grades) {
      await Review.create({
        course: course._id,
        professor: prof._id,
        author: user._id,
        difficultyRating: 3,
        usefulnessRating: 4,
        workloadRating: 3,
        writtenFeedback: `Got an ${g}`,
        isAnonymous: true,
        grade: g
      });
    }
    
    console.log(`Successfully added grade reviews to course ${course.courseCode}`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
