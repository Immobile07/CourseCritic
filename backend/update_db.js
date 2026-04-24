const mongoose = require('mongoose');
require('dotenv').config();
const Course = require('./models/Course.model');
const User = require('./models/User.model');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to DB. Updating...');
  await Course.updateMany({}, { isApproved: true });
  console.log('Set all existing courses to isApproved: true');
  
  // Make the first user an Admin, or create one if none exists
  const user = await User.findOne();
  if (user) {
    user.role = 'Admin';
    await user.save();
    console.log(`Updated user ${user.username} to Admin role`);
  } else {
    console.log('No users found in the database. Please register a user to test Admin features.');
  }

  // Also let's create an unapproved course for testing the dashboard
  const testCourse = new Course({
    courseCode: 'TEST-999',
    title: 'Unapproved Test Course',
    description: 'This is a test course that needs admin approval.',
    creditHours: 3,
    isApproved: false
  });
  await testCourse.save();
  console.log('Created unapproved test course (TEST-999)');

  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
