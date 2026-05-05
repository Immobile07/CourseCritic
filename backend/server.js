const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());

// ── Stripe webhook needs raw body BEFORE express.json() ───────────────────────
app.use('/api/features/payslip/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// ── Serve uploaded files statically ───────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import original routes
const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const professorRoutes = require('./routes/professor.routes');
const reviewRoutes = require('./routes/review.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');

// Import new feature routes
const featureRoutes = require('./routes/feature.routes');
const facultyRoutes = require('./routes/faculty.routes');
const plannerRoutes = require('./routes/planner.routes');
const forumRoutes = require('./routes/forum.routes');
const chatRoutes = require('./routes/chat.routes');

// Mount original routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/professors', professorRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Mount new feature routes
app.use('/api/features', featureRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/chat', chatRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
