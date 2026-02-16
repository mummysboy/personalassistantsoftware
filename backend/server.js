require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/auth');
const taskRoutes = require('./src/routes/tasks');
const subtaskRoutes = require('./src/routes/subtasks');
const commentRoutes = require('./src/routes/comments');
const attachmentRoutes = require('./src/routes/attachments');
const notificationRoutes = require('./src/routes/notifications');
const activityRoutes = require('./src/routes/activity');
const recurringRoutes = require('./src/routes/recurring');
const dashboardRoutes = require('./src/routes/dashboard');
const inspirationRoutes = require('./src/routes/inspiration');
const { processRecurringTasks } = require('./src/routes/recurring');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks/:id/subtasks', subtaskRoutes);
app.use('/api/tasks/:id/comments', commentRoutes);
app.use('/api/tasks/:id/activity', activityRoutes);
app.use('/api', attachmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/recurring-tasks', recurringRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dashboard', inspirationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Process recurring tasks on start and every hour
  processRecurringTasks();
  setInterval(processRecurringTasks, 60 * 60 * 1000);
});
