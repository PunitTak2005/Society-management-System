import Notice from '../model/notice.model.js';
import notificationService from '../lib/notificationService.js';
import APIFeatures from '../lib/apiFeatures.js';

// CREATE NOTICE
export const createNotice = async (req, res) => {
  try {
    const { title, description, expiryDate } = req.body;
    const postedBy = req.body.postedBy || req.user.id;

    const notice = await Notice.create({
      title,
      description,
      expiryDate,
      postedBy,
    });

   
    notificationService.broadcast('new_notice', {
      message: `A new announcement has been posted: "${notice.title}"`,
      title: notice.title,
      noticeId: notice._id,
    });

    res.status(201).json({
      message: 'Notice created successfully',
      data: notice,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// GET ALL NOTICES
export const getNotices = async (req, res) => {
  try {
    // Count matches for metadata
    const countFeatures = new APIFeatures(Notice.find(), req.query)
      .filter()
      .search(['title', 'description']);
    const totalResults = await countFeatures.query.countDocuments();

    // Query features
    const features = new APIFeatures(Notice.find(), req.query)
      .filter()
      .search(['title', 'description'])
      .sort()
      .paginate();

    const notices = await features.query.populate('postedBy', 'name email');
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    res.status(200).json({
      message: 'success',
      totalResults,
      totalPages: Math.ceil(totalResults / limit),
      page,
      limit,
      data: notices,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// GET ONE NOTICE
export const getNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findById(id).populate('postedBy', 'name email');

    if (!notice) {
      return res.status(404).json({
        message: 'Notice not found',
      });
    }

    res.status(200).json({
      message: 'success',
      data: notice,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// UPDATE NOTICE
export const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!notice) {
      return res.status(404).json({
        message: 'Notice not found',
      });
    }

    res.status(200).json({
      message: 'Notice updated successfully',
      data: notice,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

// DELETE NOTICE
export const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findByIdAndDelete(id);

    if (!notice) {
      return res.status(404).json({
        message: 'Notice not found',
      });
    }

    res.status(200).json({
      message: 'Notice deleted successfully',
      data: notice,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
