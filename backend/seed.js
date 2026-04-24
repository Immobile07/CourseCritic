const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User.model');
const Course = require('./models/Course.model');
const Professor = require('./models/Professor.model');
const Review = require('./models/Review.model');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Seeding data...');

    await User.deleteMany({});
    await Course.deleteMany({});
    await Professor.deleteMany({});
    await Review.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const admin = await User.create({ username: 'AdminUser', email: 'admin@coursecritic.com', password, role: 'Admin' });
    const student1 = await User.create({ username: 'Student1', email: 'student1@university.edu', password, role: 'Student' });

    const fs = require('fs');
    const parsedData = JSON.parse(fs.readFileSync('parsed_data.json', 'utf8'));
    
    const profMap = {};
    for (const pData of parsedData.professors) {
        const prof = await Professor.create({ name: pData.name, department: pData.department });
        profMap[pData.initial] = prof;
    }

    const courseDocs = [];
    for (const cData of parsedData.courses) {
        const profIds = cData.taughtByInitials.filter(init => profMap[init]).map(init => profMap[init]._id);
        const course = await Course.create({
            courseCode: cData.courseCode,
            title: cData.title,
            description: cData.description,
            creditHours: cData.creditHours,
            taughtBy: profIds
        });
        courseDocs.push(course);
        
        for (const profId of profIds) {
            const prof = Object.values(profMap).find(p => p._id.equals(profId));
            if (prof) {
                prof.coursesTaught.push(course._id);
                await prof.save();
            }
        }
    }

    if (courseDocs.length > 0) {
      const course1 = courseDocs[0];
      const prof1 = Object.values(profMap).find(p => p._id.equals(course1.taughtBy[0])) || Object.values(profMap)[0];
      
      await Review.create({
        course: course1._id,
        professor: prof1._id,
        author: student1._id,
        difficultyRating: 4,
        usefulnessRating: 5,
        workloadRating: 4,
        writtenFeedback: 'Tough but extremely rewarding class. Essential for interviews.',
        isAnonymous: false
      });

      await Review.create({
        course: course1._id,
        professor: prof1._id,
        author: admin._id,
        difficultyRating: 5,
        usefulnessRating: 5,
        workloadRating: 5,
        writtenFeedback: 'The assignments take way too long!',
        isAnonymous: true
      });
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
