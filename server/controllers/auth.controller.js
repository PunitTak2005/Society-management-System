import Role from '../model/role.model.js';
import User from '../model/user.model.js';
import { comparePassword, generateHash } from '../lib/hashPassword.js';
import { generatePassword } from '../lib/generatePassword.js';
import transporter, { getMailFrom } from '../lib/sendMail.js';
import { newUserRegistrationTemplate } from './../templates/NewUserRegistration.js';
import { generateToken } from '../lib/generateToken.js';
import { twoFactorOtpTemplate } from './../templates/twoFactorOtpTemplate.js';

// Register / Request Access
export const register = async (req, res) => {
  try {
    const { name, email, phone, roleId, flatId } = req.body;

    // Field validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        message: 'Full name is required.',
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: 'Email address is required.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        message: 'Please provide a valid email address.',
      });
    }

    if (!phone) {
      return res.status(400).json({
        message: 'Phone number is required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log('Creating user:', normalizedEmail);

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: `An account with ${normalizedEmail} already exists. Please try signing in.`,
      });
    }

    let role = null;
    if (roleId) {
      role = await Role.findById(roleId);
    }
    if (!role) {
      role = (await Role.findOne({ role: 'resident' })) || (await Role.findOne());
    }

    // Generate secure 10-12 char temporary password
    const password = generatePassword(10);
    const hashPass = await generateHash(password);

    const NewUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: Number(phone) || phone,
      role: role ? role._id : undefined,
      password: hashPass,
      flat: flatId || undefined,
      isActive: true,
      status: 'pending',
    });

    console.log('User created in DB with ID:', NewUser._id);

    // Attempt real email dispatch via Nodemailer
    try {
      await transporter.sendMail({
        from: getMailFrom(),
        to: NewUser.email,
        subject: 'Welcome to SMS Portal – Your Temporary Login Credentials',
        html: newUserRegistrationTemplate(password, NewUser.name, NewUser.email),
      });
      console.log(`✉️ Temporary credentials email dispatched to ${NewUser.email}`);
    } catch (mailError) {
      console.error('❌ Failed to send registration credentials email:', mailError);

      // Rollback user record so duplicate email lock is prevented on retry
      await User.findByIdAndDelete(NewUser._id);

      return res.status(500).json({
        message: "We couldn't send your temporary login credentials. Please try again later.",
      });
    }

    const alluserData = await User.findById(NewUser._id).populate('role');

    res.status(201).json({
      message: 'Your access request has been submitted successfully! Temporary login credentials have been sent to your email.',
      data: alluserData,
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      message: error.message || 'Registration failed. Please try again later.',
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    console.log('Login attempt:', normalizedEmail);

    const user = await User.findOne({ email: normalizedEmail }).populate('role');
    console.log('User found:', !!user);
    console.log('Status:', user?.status);

    if (!user) {
      return res.status(400).json({
        message: 'User is not registered , please register try again',
      });
    }

    if (user.isActive === false || user.status === 'inactive') {
      return res.status(403).json({
        message: 'Your account is deactivated. Please contact society management.',
      });
    }

    const isPassword = await comparePassword(password, user.password);
    console.log('Password match:', isPassword);
    if (!isPassword) {
      return res.status(401).json({
        message: 'Password is incorrect',
      });
    }

    const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Update user document with OTP and expiry
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    user.otpExpiresIn = otpExpiresAt;
    await user.save();

    console.log('OTP generated:', otp);
    console.log('Expires at:', otpExpiresAt);

    // Send OTP email
    try {
      await transporter.sendMail({
        from: getMailFrom(),
        to: user.email,
        subject: 'Society Management System - Your Login OTP',
        html: twoFactorOtpTemplate(user.otp, user.name, expiryMinutes),
      });
      console.log(`✉️ OTP email sent to ${user.email}`);
    } catch (mailError) {
      console.error('❌ Failed to send OTP email:', mailError);
      return res.status(500).json({
        message: 'Failed to send OTP verification email. Please check your email configuration.',
      });
    }

    res.status(200).json({
      message: `A verification email is sent to your registered email address (valid for ${expiryMinutes} minutes)`,
      otpRequired: true,
      success: true,
      expiryMinutes,
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      error: error.message,
    });
  }
};

// Resend OTP
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Email address is required to resend OTP.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).populate('role');

    if (!user) {
      return res.status(400).json({
        message: 'User is not registered, please register try again',
      });
    }

    if (user.isActive === false || user.status === 'inactive') {
      return res.status(403).json({
        message: 'Your account is deactivated. Please contact society management.',
      });
    }

    const expiryMinutes = Number(process.env.OTP_EXPIRY_MINUTES || 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Invalidate old OTP immediately and save new one
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    user.otpExpiresIn = otpExpiresAt;
    await user.save();

    console.log('🔄 New OTP generated on resend:', otp);
    console.log('Expires at:', otpExpiresAt);

    // Send OTP email
    try {
      await transporter.sendMail({
        from: getMailFrom(),
        to: user.email,
        subject: 'Society Management System - Your Login OTP',
        html: twoFactorOtpTemplate(user.otp, user.name, expiryMinutes),
      });
      console.log(`✉️ Resent OTP email to ${user.email}`);
    } catch (mailError) {
      console.error('❌ Failed to resend OTP email:', mailError);
      return res.status(500).json({
        message: 'Failed to send OTP verification email. Please try again.',
      });
    }

    res.status(200).json({
      message: `New OTP sent to your registered email address (valid for ${expiryMinutes} minutes)`,
      success: true,
      expiryMinutes,
    });
  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    res.status(500).json({
      error: error.message,
    });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: 'Email and OTP are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).populate('role');

    if (!user) {
      return res.status(404).json({
        message: 'User is not registered, please register try again',
      });
    }

    const expiryDate = user.otpExpiresAt || user.otpExpiresIn;
    const now = new Date();

    console.log('Now:', now);
    console.log('Stored Expiry:', expiryDate);
    console.log('OTP Match:', user.otp === otp?.toString()?.trim());

    if (!user.otp) {
      return res.status(401).json({
        message: 'No active OTP found. Please request a new OTP.',
      });
    }

    // Accurate timestamp comparison using epoch milliseconds
    if (expiryDate && now.getTime() > new Date(expiryDate).getTime()) {
      return res.status(401).json({
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Precise OTP comparison
    if (user.otp.toString().trim() !== otp.toString().trim()) {
      return res.status(401).json({
        message: 'Incorrect OTP.',
      });
    }

    // Clear OTP fields after successful verification to prevent reuse
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.otpExpiresIn = undefined;
    if (user.status === 'pending') {
      user.status = 'active';
    }
    await user.save();

    const userRole = user.role?.role || (typeof user.role === 'string' ? user.role : 'resident');
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: userRole,
      profilePhoto: user.profilePhoto || '',
    };
    const token = generateToken(payload);
    console.log('JWT Token generated for user:', user._id, 'with role:', userRole);

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: 'Login Successfull',
      token,
      data: payload,
    });
  } catch (error) {
    console.error('❌ Verify OTP error:', error);
    res.status(500).json({
      message: 'OTP verification failed. Please try again.',
      error: error.message,
    });
  }
};

// Verify Token Endpoint
export const verify = async (req, res) => {
  console.log('Token verified for user:', req.user);

  res.status(200).json({
    authenticated: true,
    data: req.user,
  });
};

// Logout
export const logout = async (req, res) => {
  try {
    res.cookie('token', null, {
      maxAge: 0,
    });

    res.status(200).json({
      authenticated: false,
      message: 'Logout successfull',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
