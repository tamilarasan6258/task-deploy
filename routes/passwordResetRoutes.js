const express = require('express');
const router = express.Router();
const passwordResetController = require('../controllers/passwordResetController');

/**
 * @swagger
 * tags:
 *   name: Password Reset
 *   description: Forgot and reset password flows
 */

/**
 * @swagger
 * /api/password/forgot-password:
 *   post:
 *     summary: Request password reset by sending OTP or reset link
 *     tags: [Password Reset]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset instructions sent
 *       400:
 *         description: Email not registered or error occurred
 */
router.post('/forgot-password', passwordResetController.requestPasswordReset);

/**
 * @swagger
 * /api/password/reset-password/{token}:
 *   post:
 *     summary: Reset password using token
 *     tags: [Password Reset]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token sent to user email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *             properties:
 *               token:      
 *                type: string  
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post('/reset-password/:token', passwordResetController.resetPassword);

module.exports = router;
