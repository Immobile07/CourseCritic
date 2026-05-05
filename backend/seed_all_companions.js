const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User.model');
const Course = require('./models/Course.model');
const Review = require('./models/Review.model');
const Professor = require('./models/Professor.model');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Seeding companion reviews for all courses...');

    const courses = await Course.find().populate('prerequisites');
    const defaultProf = await Professor.findOne();
    
    // We'll create a few dummy users to distribute the reviews
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('password123', salt);
    
    const students = [];
    for (let i = 1; i <= 5; i++) {
        // Check if user already exists
        let student = await User.findOne({ username: `CompanionStudent${i}` });
        if (!student) {
            student = await User.create({ 
                username: `CompanionStudent${i}`, 
                email: `companion${i}@university.edu`, 
                password, 
                role: 'Student' 
            });
        }
        students.push(student);
    }

    // Helper to get all ancestors (prereqs recursively)
    const getAllAncestors = async (courseId, ancestors = new Set()) => {
        const course = await Course.findById(courseId);
        if (!course || !course.prerequisites) return ancestors;
        for (const prereqId of course.prerequisites) {
            if (!ancestors.has(prereqId.toString())) {
                ancestors.add(prereqId.toString());
                await getAllAncestors(prereqId, ancestors);
            }
        }
        return ancestors;
    };

    let studentIdx = 0;
    
    for (const course of courses) {
        const ancestorsSet = await getAllAncestors(course._id);
        const coursesToReview = [course._id.toString(), ...Array.from(ancestorsSet)];
        
        // Pick a student for this course chain
        const student = students[studentIdx % students.length];
        studentIdx++;
        
        for (const cid of coursesToReview) {
            // Check if review already exists
            const existingReview = await Review.findOne({ course: cid, author: student._id });
            if (!existingReview) {
                const targetCourse = await Course.findById(cid);
                const profId = (targetCourse.taughtBy && targetCourse.taughtBy.length > 0) ? targetCourse.taughtBy[0] : defaultProf._id;
                
                await Review.create({
                    course: cid,
                    professor: profId,
                    author: student._id,
                    difficultyRating: Math.floor(Math.random() * 3) + 3, // 3-5
                    usefulnessRating: Math.floor(Math.random() * 3) + 3, // 3-5
                    workloadRating: Math.floor(Math.random() * 3) + 3, // 3-5
                    writtenFeedback: 'Great course, learned a lot.',
                    isAnonymous: false
                });
            }
        }
        
        // Add some lateral courses (electives) taken alongside sometimes so it's not strictly vertical prereqs
        if (Math.random() > 0.5) {
            // Add a random elective
            const electives = await Course.find({ isElective: true });
            if (electives.length > 0) {
                const randElective = electives[Math.floor(Math.random() * electives.length)];
                const existingReview = await Review.findOne({ course: randElective._id, author: student._id });
                if (!existingReview) {
                    const profId = (randElective.taughtBy && randElective.taughtBy.length > 0) ? randElective.taughtBy[0] : defaultProf._id;
                    await Review.create({
                        course: randElective._id,
                        professor: profId,
                        author: student._id,
                        difficultyRating: 3, usefulnessRating: 4, workloadRating: 3,
                        writtenFeedback: 'Fun elective!',
                        isAnonymous: false
                    });
                }
            }
        }
    }

    console.log('Successfully seeded companion data for all courses respecting prerequisite chains!');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
