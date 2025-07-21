const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); 
const authRoutes = require('./routes/authRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes')
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const healthRoute = require('./routes/healthRoutes');
const cookieParser = require('cookie-parser');



const setupSwagger = require('./config/swagger');

// Load environment variables
dotenv.config();
 
// Initialize express app - starting point of backend server
const app = express();
app.use(cookieParser());
// CORS Configuration
// app.use(cors({
//   origin: 'https://kanbanapp-task.netlify.app/' || process.env.FRONTEND_URL || 'http://localhost:4200', 
//   credentials: true         //allows aut headers to be sent across domains
// }));

const allowedOrigins = [
  'http://localhost:4200',
  'https://kanbanapp-task.netlify.app'
  
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like from curl or Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));


setupSwagger(app);

// Built-in Middleware to parse JSON request bodies(wihtout this req.body is undefined)
app.use(express.json());
 
// MongoDB Connection
connectDB();
 
// Route handlers
app.use('/api/auth', authRoutes);
app.use('/api/password', passwordResetRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes); 
app.use('/api', healthRoute);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(`Swagger docs at ${PORT}/api-docs`);
});
