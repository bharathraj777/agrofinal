import { Request, Response } from 'express';
import { User, IUser } from '../models';
import { AuthRequest, generateAccessToken, generateRefreshToken, AppError, asyncHandler } from '../middleware';
import crypto from 'crypto';

// Register new user
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone, state, location } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User with this email already exists', 400);
  }

  // Create new user
  const user = new User({
    name,
    email,
    passwordHash: password, // Will be hashed by pre-save middleware
    phone,
    state,
    location
  });

  await user.save();

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  // Store refresh token in database
  user.refreshToken = refreshToken;
  await user.save();

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        state: user.state,
        location: user.location,
        profileImage: user.profileImage
      },
      accessToken,
      refreshToken
    }
  });
});

// Login user
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    throw new AppError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  // Store refresh token in database (rotate token)
  user.refreshToken = refreshToken;
  user.lastLogin = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        state: user.state,
        location: user.location,
        profileImage: user.profileImage
      },
      accessToken,
      refreshToken
    }
  });
});

// Refresh access token
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  // Find user with this refresh token
  const user = await User.findOne({ refreshToken });
  if (!user || !user.isActive) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  // Generate new access token
  const accessToken = generateAccessToken(user);

  res.json({
    success: true,
    data: {
      accessToken
    }
  });
});

// Get current user
export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        state: user.state,
        location: user.location,
        profileImage: user.profileImage,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }
  });
});

// Logout user
export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.user!;

  // Remove refresh token from database
  user.refreshToken = undefined;
  await user.save();

  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Forgot password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal if user exists or not
    return res.json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set reset token and expiry (1 hour)
  user.passwordResetToken = resetTokenHash;
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
  await user.save();

  // TODO: Send email with reset token
  console.log(`Password reset token for ${email}: ${resetToken}`);

  res.json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent'
  });
});

// Reset password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;

  // Hash the token to compare with database
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: tokenHash,
    passwordResetExpires: { $gt: new Date() }
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  // Update password
  user.passwordHash = password; // Will be hashed by pre-save middleware
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshToken = undefined; // Invalidate all refresh tokens
  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful'
  });
});

// Change password
export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user!;

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw new AppError('Current password is incorrect', 400);
  }

  // Update password
  user.passwordHash = newPassword; // Will be hashed by pre-save middleware
  user.refreshToken = undefined; // Invalidate all refresh tokens
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});