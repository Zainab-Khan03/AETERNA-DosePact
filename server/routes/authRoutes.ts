import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // Add this import
import { 
  sendWelcomeEmail, 
  sendAccountDeletionCodeEmail, 
  sendAccountDeletionConfirmationEmail, 
  sendAccountDeletedFinalEmail, 
  sendPasswordResetEmail, 
  sendVerificationEmail, 
  generateVerificationCode 
} from '../emailService.js';
import { userStore, IUser } from '../models/User.js';
import { generateToken, requireAuth, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// ============================================================
// REGISTER
// ============================================================

router.post('/register', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      dateOfBirth, 
      phoneNumber,
      stomachConditions,
      physicianName,
      physicianPhone,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelation
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !dateOfBirth) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'First name, last name, email, password, and date of birth are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please enter a valid email address'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Weak password',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await userStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered',
        message: 'This email is already registered. Please sign in instead.'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const userData: Omit<IUser, 'id' | 'createdAt' | 'updatedAt'> = {
      email,
      passwordHash,
      firstName,
      lastName,
      dateOfBirth,
      phoneNumber: phoneNumber || '',
      profileImage: '',
      isEmailVerified: false,
      preferences: {
        language: 'en',
        timezone: 'America/New_York',
        notificationEnabled: true,
      },
      emergencyContact: {
        name: emergencyContactName || '',
        phoneNumber: emergencyContactPhone || '',
        relationship: emergencyContactRelation || 'Spouse / Partner',
      },
      stomachConditions: stomachConditions || ['None / Healthy Stomach'],
      physicianName: physicianName || '',
      physicianPhone: physicianPhone || '',
      onboardingCompleted: true,
    };

    const user = await userStore.createUser(userData);

    // Generate JWT token
    const token = generateToken(user.id);

    // Send welcome email
    await sendWelcomeEmail(email, firstName).catch(err => {
      console.warn('[WARNING] Failed to send welcome email:', err);
    });

    // Return user data (without sensitive fields)
    const { passwordHash: _, ...safeUser } = user;

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: safeUser,
      accessToken: token,
    });

  } catch (error: any) {
    console.error('[REGISTER ERROR]', error);
    return res.status(500).json({
      error: 'Registration failed',
      message: error.message || 'An error occurred during registration'
    });
  }
});

// ============================================================
// LOGIN
// ============================================================

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = await userStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id);

    // Set session
    req.session.userId = user.id;
    req.session.isAuthenticated = true;
    req.session.email = user.email;
    req.session.firstName = user.firstName;
    req.session.lastName = user.lastName;
    req.session.lastActivity = new Date().toISOString();

    // Return user data (without sensitive fields)
    const { passwordHash: _, ...safeUser } = user;

    return res.json({
      success: true,
      message: 'Login successful',
      user: safeUser,
      accessToken: token,
    });

  } catch (error: any) {
    console.error('[LOGIN ERROR]', error);
    return res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// ============================================================
// LOGOUT
// ============================================================

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('[LOGOUT ERROR]', err);
      return res.status(500).json({
        error: 'Logout failed',
        message: 'Could not destroy session'
      });
    }
    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
});

// ============================================================
// GET CURRENT USER
// ============================================================

router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const user = await userStore.findUserById(req.userId!);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User no longer exists'
      });
    }

    const { passwordHash: _, ...safeUser } = user;
    return res.json({
      success: true,
      user: safeUser,
    });
  } catch (error) {
    console.error('[GET USER ERROR]', error);
    return res.status(500).json({
      error: 'Failed to get user',
      message: 'An error occurred'
    });
  }
});

// ============================================================
// UPDATE USER
// ============================================================

router.put('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated here
    delete updates.id;
    delete updates.passwordHash;
    delete updates.email;
    delete updates.createdAt;

    const updatedUser = await userStore.updateUser(req.userId!, updates);
    if (!updatedUser) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User no longer exists'
      });
    }

    const { passwordHash: _, ...safeUser } = updatedUser;
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: safeUser,
    });
  } catch (error: any) {
    console.error('[UPDATE USER ERROR]', error);
    return res.status(500).json({
      error: 'Update failed',
      message: error.message || 'An error occurred'
    });
  }
});

// ============================================================
// DELETE ACCOUNT - REQUEST CODE
// ============================================================

router.post('/request-deletion', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { email, code } = req.body;
    const userId = req.userId!;

    const user = await userStore.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User no longer exists'
      });
    }

    // Ensure the email matches the authenticated user
    if (user.email !== email) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Email does not match authenticated user'
      });
    }

    // Use the code from the client or generate one
    let verificationCode = code || generateVerificationCode();

    // Validate code
    if (isNaN(verificationCode) || verificationCode < 100000 || verificationCode > 999999) {
      verificationCode = generateVerificationCode();
    }

    console.log('[EMAIL] Sending account deletion code to:', email);
    console.log('[EMAIL] Verification code:', verificationCode);

    // Send the verification code email
    const emailSent = await sendAccountDeletionCodeEmail(email, verificationCode);

    if (!emailSent) {
      return res.status(500).json({
        error: 'Email sending failed',
        message: 'Failed to send verification email. Please try again.'
      });
    }

    return res.json({
      success: true,
      message: 'Verification code sent successfully',
      ...(process.env.NODE_ENV === 'development' && { code: verificationCode })
    });

  } catch (error: any) {
    console.error('[REQUEST DELETION ERROR]', error);
    return res.status(500).json({
      error: 'Request failed',
      message: error.message || 'An error occurred'
    });
  }
});

// ============================================================
// DELETE ACCOUNT - CONFIRM
// ============================================================

router.post('/confirm-deletion', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { email, code } = req.body;
    const userId = req.userId!;

    const user = await userStore.findUserById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User no longer exists'
      });
    }

    // Ensure the email matches the authenticated user
    if (user.email !== email) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Email does not match authenticated user'
      });
    }

    // Delete user
    const deleted = await userStore.deleteUser(userId);
    if (!deleted) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User no longer exists'
      });
    }

    // Send confirmation email
    await sendAccountDeletionConfirmationEmail(email).catch(err => {
      console.warn('[WARNING] Failed to send deletion confirmation email:', err);
    });

    // Destroy session
    req.session.destroy((err) => {
      if (err) {
        console.error('[SESSION DESTROY ERROR]', err);
      }
    });

    return res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error: any) {
    console.error('[CONFIRM DELETION ERROR]', error);
    return res.status(500).json({
      error: 'Deletion failed',
      message: error.message || 'An error occurred'
    });
  }
});

// ============================================================
// FORGOT PASSWORD
// ============================================================

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email required',
        message: 'Please provide your email address'
      });
    }

    const user = await userStore.findUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = generateToken(user.id);
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    // Send password reset email
    await sendPasswordResetEmail(email, resetUrl).catch(err => {
      console.warn('[WARNING] Failed to send password reset email:', err);
    });

    return res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.'
    });

  } catch (error) {
    console.error('[FORGOT PASSWORD ERROR]', error);
    return res.status(500).json({
      error: 'Request failed',
      message: 'An error occurred'
    });
  }
});

// ============================================================
// RESET PASSWORD
// ============================================================

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Weak password',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aeterna-dosepact-jwt-secret-change-me') as { userId: string };
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Invalid or expired reset token'
      });
    }

    const user = await userStore.findUserById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User no longer exists'
      });
    }

    // Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userStore.updateUser(user.id, { passwordHash });

    return res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error: any) {
    console.error('[RESET PASSWORD ERROR]', error);
    return res.status(500).json({
      error: 'Reset failed',
      message: error.message || 'An error occurred'
    });
  }
});

export default router;
// server/routes/authRoutes.ts - Add JSDoc comments for Swagger

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *               - dateOfBirth
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Eleanor
 *               lastName:
 *                 type: string
 *                 example: Vance
 *               email:
 *                 type: string
 *                 format: email
 *                 example: patient@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: 1988-04-12
 *               phoneNumber:
 *                 type: string
 *                 example: +15553928811
 *               stomachConditions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Acid Reflux / GERD"]
 *               emergencyContactName:
 *                 type: string
 *                 example: Dr. Arthur Vance
 *               emergencyContactPhone:
 *                 type: string
 *                 example: +15559981244
 *               emergencyContactRelation:
 *                 type: string
 *                 example: Primary Care Physician
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login to your account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: patient@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *       - sessionAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */