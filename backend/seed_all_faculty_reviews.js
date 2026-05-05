const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User.model');
const Course = require('./models/Course.model');
const Review = require('./models/Review.model');
const Professor = require('./models/Professor.model');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Seeding reviews for all faculty members...');
    
    const professors = await Professor.find({});
    let users = await User.find({ role: 'Student' }).limit(5);
    
    // Fallback if no student users found
    if (users.length === 0) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash('password123', salt);
      users = [await User.create({ username: 'FacultyReviewer', email: 'facrev@univ.edu', password, role: 'Student' })];
    }
    
    const courses = await Course.find({});
    
    let addedReviews = 0;
    
    for (const prof of professors) {
      // Find courses this professor teaches
      let profCourses = await Course.find({ taughtBy: prof._id });
      
      // If they don't teach any course officially, assign a random course so we can review them
      if (profCourses.length === 0 && courses.length > 0) {
        profCourses = [courses[Math.floor(Math.random() * courses.length)]];
      }
      
      if (profCourses.length === 0) continue;
      
      // Check if they already have reviews
      const reviewCount = await Review.countDocuments({ professor: prof._id });
      
      if (reviewCount === 0) {
        // Add 1 to 3 random reviews
        const numReviews = Math.floor(Math.random() * 3) + 1; 
        for (let i = 0; i < numReviews; i++) {
          const user = users[Math.floor(Math.random() * users.length)];
          const course = profCourses[Math.floor(Math.random() * profCourses.length)];
          
          await Review.create({
            course: course._id,
            professor: prof._id,
            author: user._id,
            difficultyRating: Math.floor(Math.random() * 3) + 3,
            usefulnessRating: Math.floor(Math.random() * 3) + 3,
            workloadRating: Math.floor(Math.random() * 3) + 3,
            writtenFeedback: ['Excellent professor, very helpful!', 'Lectures were a bit fast but overall good.', 'Cares a lot about students.', 'Assignments were tough but fair.', 'Always available during office hours.'][Math.floor(Math.random() * 5)],
            isAnonymous: Math.random() > 0.5,
            grade: ['A', 'B', 'B', 'C'][Math.floor(Math.random() * 4)]
          });
          addedReviews++;
        }
      }
    }
    
    console.log(`Successfully added ${addedReviews} dummy reviews across all faculty members.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
