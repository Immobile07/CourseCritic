const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User.model');
const Course = require('./models/Course.model');
const Faculty = require('./models/Faculty.model');
const Review = require('./models/Review.model');
const ForumTopic = require('./models/ForumTopic.model');
const ForumAnswer = require('./models/ForumAnswer.model');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Seeding data...');

    await User.deleteMany({});
    await Course.deleteMany({});
    await Faculty.deleteMany({});
    await Review.deleteMany({});
    await ForumTopic.deleteMany({});
    await ForumAnswer.deleteMany({});

    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);

    const admin = await User.create({ username: 'AdminUser', email: 'admin@coursecritic.com', password, role: 'Admin' });
    const student1 = await User.create({ username: 'Student1', email: 'student1@university.edu', password, role: 'Student' });

    const fs = require('fs');
    const parsedData = JSON.parse(fs.readFileSync('parsed_data.json', 'utf8'));
    
    const facultyMap = {};
    for (const fData of parsedData.faculty) {
        const faculty = await Faculty.create({ name: fData.name, department: fData.department });
        facultyMap[fData.initial] = faculty;
    }

    const courseDocs = [];
    for (const cData of parsedData.courses) {
        const facultyIds = cData.taughtByInitials.filter(init => facultyMap[init]).map(init => facultyMap[init]._id);
        
        // Extract department from courseCode (e.g. "CSE" from "CSE101")
        const deptMatch = cData.courseCode.match(/^[A-Za-z]+/);
        const department = deptMatch ? deptMatch[0].toUpperCase() : 'UNKNOWN';
        
        // Dummy prerequisite logic: if course code ends with '1' and > 100, make the '0' version a prereq
        const prerequisites = [];
        const codeNumMatch = cData.courseCode.match(/\d+$/);
        if (codeNumMatch) {
            const num = parseInt(codeNumMatch[0]);
            if (num > 100 && num % 10 !== 0) {
                // e.g. CSE111 -> relies on CSE110
                const baseCode = cData.courseCode.replace(/\d+$/, '');
                prerequisites.push(`${baseCode}${num - 1}`);
            }
        }

        const course = await Course.create({
            courseCode: cData.courseCode,
            title: cData.title,
            description: cData.description,
            creditHours: cData.creditHours,
            department: department,
            prerequisites: prerequisites,
            taughtBy: facultyIds
        });
        courseDocs.push(course);
        
        for (const facultyId of facultyIds) {
            const faculty = Object.values(facultyMap).find(f => f._id.equals(facultyId));
            if (faculty) {
                faculty.coursesTaught.push(course._id);
                await faculty.save();
            }
        }
    }

    if (courseDocs.length > 0) {
      const course1 = courseDocs[0];
      const faculty1 = Object.values(facultyMap).find(f => f._id.equals(course1.taughtBy[0])) || Object.values(facultyMap)[0];
      
      await Review.create({
        course: course1._id,
        faculty: faculty1._id,
        author: student1._id,
        difficultyRating: 4,
        usefulnessRating: 5,
        workloadRating: 4,
        writtenFeedback: 'Tough but extremely rewarding class. Essential for interviews.',
        isAnonymous: false
      });

      await Review.create({
        course: course1._id,
        faculty: faculty1._id,
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
