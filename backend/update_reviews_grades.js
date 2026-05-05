const mongoose = require('mongoose');
require('dotenv').config();
const Review = require('./models/Review.model');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Adding random grades to all existing reviews...');
    
    // Find all reviews that do NOT have a grade yet
    const reviews = await Review.find({ grade: { $exists: false } });
    
    // We heavily weight towards A, B, C to make it look somewhat realistic
    const grades = ['A', 'A', 'A', 'B', 'B', 'B', 'B', 'C', 'C', 'D', 'F', 'I', 'W'];
    
    let updateCount = 0;
    for (const r of reviews) {
      r.grade = grades[Math.floor(Math.random() * grades.length)];
      await r.save();
      updateCount++;
    }
    
    console.log(`Successfully updated ${updateCount} existing reviews with a random grade.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
