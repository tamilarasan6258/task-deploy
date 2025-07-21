const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState; // 1 = connected

  res.status(200).json({
    status: 'OK',
    message: 'Server is healthy',
    dbConnected: dbStatus === 1,
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

module.exports = router;
