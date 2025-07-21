//Purpose - to verify JWT Token

const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // Get token from authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))     //bcoz tokens are expected in the format "Bearer <token>"
    {
    return res.status(401).json({ status: 'error', msg: 'Authorization token missing or invalid' });
  }

  //splitting authHeader to extract the token
  const token = authHeader.split(' ')[1];

  try {
    //JWT verification using jwt.verify()
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Add decoded user to request-->accessed by controllers
    next();
  } 
  catch (err) {
    res.status(401).json({ status: 'error', msg: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;