const otpMap = new Map(); // key: email, value: { otp, expiresAt } for storing temporary OTP codes, Map() is used

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP(random)

const setOTP = (email, otp) => {
  const expiresAt = Date.now() + 5 * 60 * 1000; // expires in 5 minutes
  otpMap.set(email, { otp, expiresAt });
};

const verifyOTP = (email, enteredOtp) => {
  const record = otpMap.get(email);
  if (!record) return false;
  const { otp, expiresAt } = record;
  const isValid = otp === enteredOtp && Date.now() < expiresAt;
  if (isValid) otpMap.delete(email); // OTP one-time use(so delete after one time use)
  return isValid;
};

module.exports = { generateOTP, setOTP, verifyOTP };
