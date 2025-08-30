const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

// auth
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const cron = require('node-cron');

dotenv.config();
const app = express();
app.use(cors());


// step 2 : connect db
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

// Task Schema
const TaskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    dueDate: {
      type: Date,
      //   default: Date.now   // 👈 always saves current date if not provided
    },
    priority: {
      type: String,
      enum: ["High", "Medium", "Low"],
      default: "Medium",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AuthUser',
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
    lastReminderSent: {
      type: Date
    }
  },
  { strict: false, timestamps: true }
);

// User Schema for Authentication
const AuthUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
}, {
  timestamps: true
});

const TaskDB = mongoose.model("Task", TaskSchema);
const AuthUser = mongoose.model("AuthUser", AuthUserSchema);

// Add indexes for better performance on reminder queries
TaskSchema.index({ completed: 1, dueDate: 1, userId: 1 });
TaskSchema.index({ lastReminderSent: 1 });

// step 4 : middleware to parse JSON
app.use(express.json());

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS  // Your email password or app password
  }
});

// Function to send welcome email
const sendWelcomeEmail = async (userEmail, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Welcome to Task Manager!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Welcome to Task Manager, ${userName}!</h2>
        <p>Thank you for signing up! We're excited to have you on board.</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>What's next?</h3>
          <ul>
            <li>Start creating your first task</li>
            <li>Organize tasks by priority</li>
            <li>Set due dates to stay on track</li>
            <li>Switch between light and dark themes</li>
          </ul>
        </div>
        <p style="color: #6B7280;">Happy task managing!</p>
        <p style="color: #6B7280; font-size: 12px;">Best regards,<br>Task Manager Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Function to send task reminder email
const sendTaskReminder = async (userEmail, userName, task, hoursLeft) => {
  const urgencyColor = hoursLeft <= 12 ? '#EF4444' : '#F59E0B';
  const urgencyText = hoursLeft <= 12 ? 'URGENT' : 'REMINDER';
  const priorityColors = {
    'High': '#EF4444',
    'Medium': '#F59E0B',
    'Low': '#10B981'
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: `${urgencyText}: Task "${task.title}" due in ${hoursLeft} hours!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: ${urgencyColor}; color: white; padding: 15px; border-radius: 8px 8px 0 0;">
          <h2 style="margin: 0; color: white;">${urgencyText}: Task Due Soon!</h2>
        </div>
        <div style="background-color: #F9FAFB; padding: 20px; border: 1px solid #E5E7EB;">
          <h3 style="color: #374151; margin-top: 0;">Hi ${userName},</h3>
          <p style="color: #6B7280;">Your task is due in <strong style="color: ${urgencyColor};">${hoursLeft} hours</strong>!</p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 4px solid ${priorityColors[task.priority]}; margin: 20px 0;">
            <h4 style="color: #374151; margin: 0 0 10px 0;">📋 ${task.title}</h4>
            <p style="color: #6B7280; margin: 10px 0;"><strong>Description:</strong> ${task.description || 'No description provided'}</p>
            <div style="display: flex; gap: 20px; margin-top: 15px;">
              <span style="background-color: ${priorityColors[task.priority]}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold;">
                ${task.priority} Priority
              </span>
              <span style="color: #6B7280; font-size: 14px;">
                📅 Due: ${new Date(task.dueDate).toLocaleDateString()} at ${new Date(task.dueDate).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p style="color: ${urgencyColor}; font-weight: bold; font-size: 16px;">
              ${hoursLeft <= 12 ? '⚠️ This is urgent! Complete your task soon.' : '⏰ Don\'t forget to complete your task!'}
            </p>
          </div>

          <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
            You're receiving this because you have an upcoming task deadline. Once you mark the task as completed, you won't receive further reminders.
          </p>
        </div>
        <div style="background-color: #374151; color: #9CA3AF; text-align: center; padding: 15px; border-radius: 0 0 8px 8px; font-size: 12px;">
          Best regards,<br>Task Manager Team
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Reminder email sent to ${userEmail} for task: ${task.title} (${hoursLeft}h before due)`);
    return true;
  } catch (error) {
    console.error('Error sending reminder email:', error);
    return false;
  }
};

// Function to check and send task reminders
const checkTaskReminders = async () => {
  try {
    console.log('🔔 Checking for task reminders...', new Date().toLocaleString());
    
    const now = new Date();
    const twentyFourHoursLater = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twelveHoursLater = new Date(now.getTime() + 12 * 60 * 60 * 1000);
    const twentyFourHoursEarlier = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twelveHoursEarlier = new Date(now.getTime() - 12 * 60 * 60 * 1000);

    // Find tasks that need 24-hour reminders
    const tasksFor24hReminder = await TaskDB.find({
      completed: false,
      dueDate: {
        $gte: twentyFourHoursEarlier,
        $lte: twentyFourHoursLater
      },
      $or: [
        { reminderSent: false },
        { reminderSent: { $exists: false } },
        { 
          lastReminderSent: { 
            $lt: new Date(now.getTime() - 23 * 60 * 60 * 1000) // Last reminder was more than 23 hours ago
          }
        }
      ]
    }).populate('userId');

    // Find tasks that need 12-hour reminders
    const tasksFor12hReminder = await TaskDB.find({
      completed: false,
      dueDate: {
        $gte: twelveHoursEarlier,
        $lte: twelveHoursLater
      },
      lastReminderSent: {
        $lt: new Date(now.getTime() - 11 * 60 * 60 * 1000) // Last reminder was more than 11 hours ago
      }
    }).populate('userId');

    let remindersSent = 0;

    // Send 24-hour reminders
    for (const task of tasksFor24hReminder) {
      if (task.userId && task.userId.email) {
        const hoursUntilDue = Math.round((new Date(task.dueDate) - now) / (1000 * 60 * 60));
        
        // Only send if it's approximately 24 hours (between 22-26 hours)
        if (hoursUntilDue >= 22 && hoursUntilDue <= 26) {
          const emailSent = await sendTaskReminder(
            task.userId.email,
            task.userId.name,
            task,
            24
          );

          if (emailSent) {
            await TaskDB.findByIdAndUpdate(task._id, {
              reminderSent: true,
              lastReminderSent: now
            });
            remindersSent++;
          }
        }
      }
    }

    // Send 12-hour reminders
    for (const task of tasksFor12hReminder) {
      if (task.userId && task.userId.email) {
        const hoursUntilDue = Math.round((new Date(task.dueDate) - now) / (1000 * 60 * 60));
        
        // Only send if it's approximately 12 hours (between 10-14 hours)
        if (hoursUntilDue >= 10 && hoursUntilDue <= 14) {
          const emailSent = await sendTaskReminder(
            task.userId.email,
            task.userId.name,
            task,
            12
          );

          if (emailSent) {
            await TaskDB.findByIdAndUpdate(task._id, {
              lastReminderSent: now
            });
            remindersSent++;
          }
        }
      }
    }

    if (remindersSent > 0) {
      console.log(`✅ Sent ${remindersSent} task reminder(s)`);
    } else {
      console.log('📭 No reminders needed at this time');
    }

  } catch (error) {
    console.error('❌ Error checking task reminders:', error);
  }
};

// Schedule reminder checks every 2 minutes (for testing)
cron.schedule('*/30 * * * *', () => {
  checkTaskReminders();
});

// Run initial check when server starts
setTimeout(() => {
  checkTaskReminders();
}, 5000); // Wait 5 seconds after server start

// User Registration
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = new AuthUser({
      name,
      email,
      password: hashedPassword
    });

    await newUser.save();

    // Send welcome email
    await sendWelcomeEmail(email, name);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email, name: newUser.name },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// User Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await AuthUser.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, name: user.name },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});
// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ADD TASK (Protected route)
app.post("/addTask", authenticateToken, async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      userId: req.user.userId
    };
    const client = new TaskDB(taskData);
    await client.save();
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task' });
  }
});

// DELETE TASK (Protected route)
app.delete("/deleteTask/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await TaskDB.deleteOne({ 
      _id: id, 
      userId: req.user.userId 
    });
    res.json({ message: "Task deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// Update the TASK (Protected route)
app.put("/updateTask/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedTask = await TaskDB.findByIdAndUpdate(
      { _id: id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    res.json({ message: "Task Updated Successfully!" });
  } catch (error) {
    res.status(500).json({ message: 'Error updating task' });
  }
});

// Fetch all tasks (Protected route)
app.get("/tasks", authenticateToken, async (req, res) => {
  try {
    let data = await TaskDB.find({ userId: req.user.userId });
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    // sort all tasks by priority
    data = data.sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// fetch specific (Protected route)
app.get("/task/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await TaskDB.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task' });
  }
});

// Toggle task completion (Protected route)
app.patch("/toggleTask/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await TaskDB.findOne({ 
      _id: id, 
      userId: req.user.userId 
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = await TaskDB.findByIdAndUpdate(
      id,
      { 
        completed: !task.completed,
        completedAt: !task.completed ? new Date() : null
      },
      { new: true }
    );

    res.json({ 
      message: updatedTask.completed ? "Task marked as completed!" : "Task marked as pending!",
      task: updatedTask
    });
  } catch (error) {
    console.error('Toggle task error:', error);
    res.status(500).json({ message: 'Error toggling task completion' });
  }
});

// Get completed tasks (Protected route)
app.get("/completed-tasks", authenticateToken, async (req, res) => {
  try {
    const completedTasks = await TaskDB.find({ 
      userId: req.user.userId,
      completed: true 
    }).sort({ completedAt: -1 });

    res.json(completedTasks);
  } catch (error) {
    console.error('Fetch completed tasks error:', error);
    res.status(500).json({ message: 'Error fetching completed tasks' });
  }
});

// Get active (pending) tasks (Protected route)
app.get("/active-tasks", authenticateToken, async (req, res) => {
  try {
    let data = await TaskDB.find({ 
      userId: req.user.userId,
      completed: false 
    });
    const priorityOrder = { High: 1, Medium: 2, Low: 3 };
    // sort all tasks by priority
    data = data.sort((a, b) => {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching active tasks' });
  }
});

// Token validation endpoint (Protected route)
app.get("/validate-token", authenticateToken, async (req, res) => {
  try {
    // If we reach here, the token is valid
    const user = await AuthUser.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      valid: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during token validation' });
  }
});

// Manual trigger for testing reminders (Protected route)
app.post("/trigger-reminders", authenticateToken, async (req, res) => {
  try {
    await checkTaskReminders();
    res.json({ message: 'Reminder check completed successfully' });
  } catch (error) {
    console.error('Manual reminder trigger error:', error);
    res.status(500).json({ message: 'Error triggering reminders' });
  }
});

// Get notification settings/stats (Protected route)
app.get("/notification-stats", authenticateToken, async (req, res) => {
  try {
    const upcomingTasks = await TaskDB.find({
      userId: req.user.userId,
      completed: false,
      dueDate: { $gte: new Date() }
    }).sort({ dueDate: 1 });

    const now = new Date();
    const next24Hours = upcomingTasks.filter(task => {
      const hoursUntilDue = (new Date(task.dueDate) - now) / (1000 * 60 * 60);
      return hoursUntilDue <= 24 && hoursUntilDue > 0;
    });

    const next12Hours = upcomingTasks.filter(task => {
      const hoursUntilDue = (new Date(task.dueDate) - now) / (1000 * 60 * 60);
      return hoursUntilDue <= 12 && hoursUntilDue > 0;
    });

    res.json({
      totalUpcomingTasks: upcomingTasks.length,
      tasksInNext24Hours: next24Hours.length,
      tasksInNext12Hours: next12Hours.length,
      upcomingTasks: upcomingTasks.map(task => ({
        id: task._id,
        title: task.title,
        dueDate: task.dueDate,
        priority: task.priority,
        hoursUntilDue: Math.round((new Date(task.dueDate) - now) / (1000 * 60 * 60)),
        reminderSent: task.reminderSent || false,
        lastReminderSent: task.lastReminderSent
      }))
    });
  } catch (error) {
    console.error('Notification stats error:', error);
    res.status(500).json({ message: 'Error fetching notification stats' });
  }
});

const PORT = process.env.port || 5000;
app.listen(PORT, () => {
  console.log("App listening on port 5000");
});
