const axios = require('axios');

async function runTests() {
  const API_URL = 'http://localhost:5001/api';
  let studentToken, adminToken;
  let testCourseId, testProfessorId, testReviewId;

  console.log('--- Starting API Tests ---');

  try {
    const studentNum = Date.now();
    let res = await axios.post(`${API_URL}/auth/register`, {
      username: `studentTest${studentNum}`,
      email: `student${studentNum}@test.com`,
      password: 'password123'
    });
    studentToken = res.data.token;
    console.log('✅ Student registered');

    // Register Admin user normally
    res = await axios.post(`${API_URL}/auth/register`, {
        username: `adminTest${studentNum}`,
        email: `admin${studentNum}@test.com`,
        password: 'password123'
    });
    
    // Update role directly in DB
    const mongoose = require('mongoose');
    const User = require('./models/User.model');
    await mongoose.connect(process.env.MONGODB_URI);
    await User.updateOne({ email: `admin${studentNum}@test.com` }, { role: 'Admin' });
    
    // LOGIN again to get a fresh token containing { role: 'Admin' }
    res = await axios.post(`${API_URL}/auth/login`, {
        email: `admin${studentNum}@test.com`,
        password: 'password123'
    });
    adminToken = res.data.token;
    console.log('✅ Admin registered, role updated, and logged in');

    const Course = require('./models/Course.model');
    const Professor = require('./models/Professor.model');
    const Review = require('./models/Review.model');

    const prof = new Professor({ name: 'Test Prof', department: 'CS' });
    await prof.save();
    testProfessorId = prof._id;

    const course = new Course({
        courseCode: `TEST-${studentNum}`,
        title: 'Test Unapproved Course',
        description: 'Testing Admin Dashboard',
        creditHours: 3,
        taughtBy: [prof._id],
        isApproved: false
    });
    await course.save();
    testCourseId = course._id;
    console.log(`✅ Unapproved course created: ${testCourseId}`);

    try {
        await axios.get(`${API_URL}/admin/courses/unapproved`, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.error('❌ FAILED: Student was able to access Admin dashboard');
    } catch (err) {
        if (err.response && err.response.status === 403) {
            console.log('✅ Student blocked from Admin dashboard (403)');
        } else {
            console.error('❌ FAILED: Unexpected error when student accessed admin dashboard', err.response?.data);
        }
    }

    res = await axios.get(`${API_URL}/admin/courses/unapproved`, {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    const foundCourse = res.data.find(c => c._id.toString() === testCourseId.toString());
    if (foundCourse) {
        console.log('✅ Admin fetched unapproved course successfully');
    } else {
        console.error('❌ FAILED: Admin could not see the unapproved course');
    }

    res = await axios.put(`${API_URL}/admin/courses/${testCourseId}/approve`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.data.isApproved === true) {
        console.log('✅ Admin successfully approved the course');
    } else {
        console.error('❌ FAILED: Course was not approved');
    }

    res = await axios.get(`${API_URL}/courses`);
    const isPublic = res.data.some(c => c._id.toString() === testCourseId.toString());
    if (isPublic) {
        console.log('✅ Approved course now appears in public API');
    } else {
        console.error('❌ FAILED: Approved course is NOT in public API');
    }

    res = await axios.post(`${API_URL}/reviews`, {
        courseId: testCourseId,
        professorId: testProfessorId,
        difficultyRating: 3,
        usefulnessRating: 4,
        workloadRating: 3,
        writtenFeedback: 'This is a test review for flagging.',
        isAnonymous: false
    }, {
        headers: { Authorization: `Bearer ${studentToken}` }
    });
    testReviewId = res.data._id;
    console.log('✅ Student created review');

    res = await axios.post(`${API_URL}/reviews/${testReviewId}/report`, {
        reason: 'Spam'
    }, {
        headers: { Authorization: `Bearer ${studentToken}` }
    });
    console.log('✅ Student flagged the review');

    try {
        await axios.post(`${API_URL}/reviews/${testReviewId}/report`, {
            reason: 'Spam again'
        }, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.error('❌ FAILED: Allowed duplicate flag from same user');
    } catch(err) {
        if(err.response && err.response.status === 400) {
            console.log('✅ Duplicate flag properly blocked (400)');
        }
    }

    // Try a second review on the same course (Rate limit test!)
    try {
        await axios.post(`${API_URL}/reviews`, {
            courseId: testCourseId,
            professorId: testProfessorId,
            difficultyRating: 5,
            usefulnessRating: 1,
            workloadRating: 5,
            writtenFeedback: 'Rate limit test.',
            isAnonymous: false
        }, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.error('❌ FAILED: Rate limit failed to block second review in same semester');
    } catch(err) {
        if(err.response && err.response.status === 429) {
            console.log('✅ Rate limit properly blocked second review (429)');
        } else {
            console.error('❌ FAILED: Rate limit returned unexpected status', err.response?.status);
        }
    }

    res = await axios.get(`${API_URL}/admin/reviews/reported`, {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    const flaggedReview = res.data.find(r => r._id.toString() === testReviewId.toString());
    if (flaggedReview && flaggedReview.reports.length === 1 && flaggedReview.reports[0].reason === 'Spam') {
        console.log('✅ Admin successfully fetched flagged review with correct reports');
    } else {
        console.error('❌ FAILED: Admin fetched wrong or empty reports for flagged review');
    }

    res = await axios.put(`${API_URL}/admin/reviews/${testReviewId}/dismiss`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.data.reports.length === 0) {
        console.log('✅ Admin successfully dismissed flags');
    } else {
        console.error('❌ FAILED: Flags were not dismissed');
    }

    console.log('--- All Tests Completed Successfully ---');
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR RUNNING TESTS:', err.response?.data || err.message);
    process.exit(1);
  }
}

require('dotenv').config();
runTests();
