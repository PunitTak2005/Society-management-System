import Complaint from '../model/complaint.model.js';
import User from '../model/user.model.js';
import { userConnectionDetails } from '../app.js';
import notificationService from '../lib/notificationService.js';
import APIFeatures from '../lib/apiFeatures.js';

export const createComplaint = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    console.log(req.io);

    const resident = req.body.resident || req.user.id;

    const complaint = await Complaint.create({
      title,
      description,
      status: status || 'pending',
      resident,
    });

    const allUsers = await User.find().populate('role');
    const adminUsers = allUsers.filter((user) => user.role && user.role.role === 'admin');

    const adminIds = adminUsers.map((admin) => admin._id.toString());
    notificationService.sendToUsers(adminIds, 'new_complaint', {
      message: 'A new complaint has been filed.',
      title: complaint.title,
      complaintId: complaint._id,
    });

    res.status(201).json({
      message: 'Complaint created successfully',
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getComplaints = async (req, res) => {
  try {
    let baseQuery = Complaint.find();

   
    if (req.user.role === 'resident') {
      baseQuery = Complaint.find({ resident: req.user.id });
    }

  
    const countFeatures = new APIFeatures(baseQuery.clone(), req.query)
      .filter()
      .search(['title', 'description']);
    const totalResults = await countFeatures.query.countDocuments();

  
    const features = new APIFeatures(baseQuery, req.query)
      .filter()
      .search(['title', 'description'])
      .sort()
      .paginate();

    const complaints = await features.query.populate('resident', 'name email');
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    res.status(200).json({
      message: 'success',
      totalResults,
      totalPages: Math.ceil(totalResults / limit),
      page,
      limit,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};

export const getComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id).populate(
      'resident',
      'name email'
    );

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found',
      });
    }

    res.status(200).json({
      message: 'success',
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


export const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found',
      });
    }

   
    if (complaint.resident && req.body.status) {
      notificationService.sendToUser(complaint.resident, 'complaint_status_update', {
        message: `Your complaint "${complaint.title}" status has been updated to "${complaint.status}".`,
        title: complaint.title,
        complaintId: complaint._id,
        status: complaint.status,
      });
    }

    res.status(200).json({
      message: 'Complaint updated successfully',
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};


export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findByIdAndDelete(id);

    if (!complaint) {
      return res.status(404).json({
        message: 'Complaint not found',
      });
    }

    res.status(200).json({
      message: 'Complaint deleted successfully',
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};
