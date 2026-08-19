import User from '../model/user.model.js';
import { generateHash, comparePassword } from '../lib/hashPassword.js';
import { uploadToS3 } from '../lib/s3.js';
import APIFeatures from '../lib/apiFeatures.js';

export const getAllUser = async (req, res) => {
  try {
    // Count matches for metadata
    const countFeatures = new APIFeatures(User.find(), req.query)
      .filter()
      .search(['name', 'email']);
    const totalResults = await countFeatures.query.countDocuments();

    // Query features
    const features = new APIFeatures(User.find(), req.query)
      .filter()
      .search(['name', 'email'])
      .sort()
      .paginate();

    // Execute query with populations
    const users = await features.query
      .populate('role')
      .populate('flat')
      .select('-password');

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    res.status(200).json({
      message: 'success',
      totalResults,
      totalPages: Math.ceil(totalResults / limit),
      page,
      limit,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }
    res.status(200).json({
      message: 'User deactivated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate('role').populate('flat');
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }
    res.status(200).json({
      message: 'success',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await generateHash(updateData.password);
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('role')
      .populate('flat');

    if (!updatedUser) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.status(200).json({
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const updateProfilePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a profile photo to upload.' });
    }

    // Stream directly to Amazon S3 using EC2 IAM Role credentials / .env keys
    const photoUrl = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype);

    const user = await User.findByIdAndUpdate(
      id,
      { profilePhoto: photoUrl },
      { new: true }
    ).populate('role').populate('flat');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Profile photo uploaded successfully',
      profilePhoto: photoUrl,
      data: user,
    });
  } catch (error) {
    // Added explicit server-side error logging to catch S3/Database issues in PM2 logs
    console.error("🔴 DETAILED PROFILE PHOTO UPLOAD CRASH:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateSelfProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email, phone },
      { new: true, runValidators: true }
    ).populate('role').populate('flat');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const changeSelfPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    user.password = await generateHash(newPassword);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
