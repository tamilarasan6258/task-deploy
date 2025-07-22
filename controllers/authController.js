const User = require('../models/userModel');
const bcrypt = require('bcryptjs');       //for hashing password
const jwt = require('jsonwebtoken');      //creates token for new user login
const { sendWelcomeEmail, sendOTPEmail } = require('../services/emailService');
const { generateOTP, setOTP, verifyOTP } = require('../services/otpService');

// REGISTER CONTROLLER - Handles user registration
exports.register = async (req, res) => {
  //takes username from the request made
  const { uname, email, password } = req.body;

  try 
  {
    // Check if username or email already exists in MongoDB
    const userExists = await User.findOne({
      $or: [{ uname }, { email }]
    });

    if (userExists) {
      return res.status(400).json({ msg: 'Username or Email already exists' });
    }

    // Hash the password - 10 salt rounds(salt: randome value added to the pw before hashing it)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with hashed password
    const newUser = new User({
      uname,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    await sendWelcomeEmail(email, uname);

    res.status(201).json({ msg: 'User registered successfully and welcome email sent' });
  } 
  catch (err) 
  {
    console.error('Registration Error:', err.message);
    res.status(500).json({ msg: 'Server error during registration' });
  }
};

// LOGIN CONTROLLER - Handles user login
exports.login = async (req, res) => {
  const { uname, password } = req.body;

  try 
  {
    // Check if user exists by username
    const user = await User.findOne({ uname });

    if (!user) 
    {
      return res.status(400).json({ msg: 'Invalid username or password' });
    }

    // Compare plain password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) 
    {
      return res.status(400).json({ msg: 'Invalid username or password' });
    }

    // Generate JWT token
    const acesstoken = jwt.sign(
      {
        userId: user._id,
        uname: user.uname,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '10s' }
    );


 // Refresh Token (7d)
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '7d' }
      // { expiresIn: '1m' }


    );

    // Store refresh token in secure HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      // maxAge: 1 * 60 * 1000 // 7 days

    });



    //Send back a response with token and user details
    res.json({
      msg: 'Login successful',
      acesstoken,
      user: {
        uname: user.uname,
        email: user.email,
        id: user._id
      }
    });
  } 
  catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).json({ msg: 'Server error during login' });
  }
};

exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ msg: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

      // Fetch user details
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Re-issue short-lived access token
    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        uname: user.uname,
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '10s' }
    );

    // res.status(200).json({ accessToken: newAccessToken });

    res.status(200).json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        uname: user.uname,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Refresh Token Error:', err.message);
    res.status(403).json({ msg: 'Invalid or expired refresh token' });
  }
};


exports.logout = (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  });
  return res.status(200).json({ message: 'Logged out successfully' });
};



// SEND OTP CONTROLLER - To send OTP
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  const otp = generateOTP();
  setOTP(email, otp);
  try {
    await sendOTPEmail(email, otp);
    res.status(200).json({ msg: 'OTP sent to email' });
  } 
  catch (err) {
    console.error('Error while sending OTP:', err); 
    res.status(500).json({ msg: 'Failed to send OTP' });
  }
};

// VERIFY OTP CONTROLLER - To verify OTP
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const isValid = verifyOTP(email, otp);
  if (isValid) 
  {
    res.status(200).json({ msg: 'OTP verified' });
  } 
  else 
  {
    res.status(400).json({ msg: 'Invalid or expired OTP' });
  }
};

// UPDATE USERNAME CONTROLLER - Handles username updates with uniqueness validation
exports.updateUsername = async (req, res) => {
  const { newUsername } = req.body;
  const userId = req.user.userId; // Get from auth middleware

  try {
    // Validate input
    if (!newUsername) {
      return res.status(400).json({ msg: 'New username is required' });
    }

    const trimmedUsername = newUsername.trim();
    if (trimmedUsername.length === 0) {
      return res.status(400).json({ msg: 'Username cannot be empty' });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if the new username is the same as current
    if (user.uname === trimmedUsername) {
      return res.status(200).json({ msg: 'Username is already set to this value' });
    }

    // Check if the new username already exists (case-insensitive)
    const existingUser = await User.findOne({ 
      uname: { $regex: new RegExp(`^${trimmedUsername}$`, 'i') },
      _id: { $ne: userId } // Exclude current user
    });

    if (existingUser) {
      return res.status(409).json({ msg: 'Username already exists' });
    }

    // Update the username
    await User.findByIdAndUpdate(userId, { uname: trimmedUsername });

    // Generate new JWT token with updated username
    const newToken = jwt.sign(
      {
        userId: user._id,
        uname: trimmedUsername, // Updated username
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );


    res.status(200).json({ 
      msg: 'Username updated successfully',
      newUsername: trimmedUsername,
      acesstoken: newToken // Return new token with updated username
    });
  } 
  catch (err) {
    console.error('Update Username Error:', err.message);
    res.status(500).json({ msg: 'Server error during username update' });
  }
};

// CHANGE PASSWORD CONTROLLER - Handles password changes with current password verification
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId; // Get from auth middleware

  try {
    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ msg: 'New password must be at least 6 characters long' });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({ msg: 'New password must be different from current password' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.status(200).json({ msg: 'Password changed successfully' });
  } 
  catch (err) {
    console.error('Change Password Error:', err.message);
    res.status(500).json({ msg: 'Server error during password change' });
  }
};

// CHECK UNAME AND EMAIL CONTROLLER - Checks uname and email for validation
exports.checkUsernameEmail = async (req, res) => {
  const { uname, email } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ uname }, { email }]
    });

    if (user) {
      const usernameExists = user.uname === uname;
      const emailExists = user.email === email;

      if (usernameExists && emailExists) {
        return res.status(409).json({ msg: 'Username and Email already exist' });
      } 
      else if (usernameExists) {
        return res.status(409).json({ msg: 'Username already exists' });
      } 
      else if (emailExists) {
        return res.status(409).json({ msg: 'Email already exists' });
      }
    }
    return res.status(200).json({ msg: 'Username and Email are available' });
  } 
  catch (err) 
  {
    res.status(500).json({ msg: 'Server error while checking user info' });
  }
};

// CHECK UNAME CONTROLLER - Checks uname for validation
exports.checkUsername = async (req, res) => {
  const { uname } = req.body;

  try {
    // Validate input
    if (!uname || uname.trim() === '') {
      return res.status(400).json({ msg: 'Username is required' });
    }

    const trimmedUsername = uname.trim();

    // Perform case-insensitive username check using regex
    const user = await User.findOne({ 
      uname: { $regex: new RegExp(`^${trimmedUsername}$`, 'i') }
    });

    if (user) {
      return res.status(409).json({ msg: 'Username already exists' });
    }

    return res.status(200).json({ msg: 'Username is available' });
  } 
  catch (err) 
  {
    console.error('Error checking username:', err.message);
    res.status(500).json({ msg: 'Server error while checking username' });
  }
};
