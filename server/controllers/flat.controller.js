import Flat from '../model/flat.model.js';
import User from '../model/user.model.js';
import APIFeatures from '../lib/apiFeatures.js';

export const createFlat = async (req, res) => {
  try {
    const { flatNumber, block, floor } = req.body;
    const newFlat = await Flat.create({ flatNumber, block, floor });
    res.status(201).json({
      message: 'Flat created successfully',
      data: newFlat,
    });
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const getFlats = async (req, res) => {
  try {
   
    const countFeatures = new APIFeatures(Flat.find(), req.query)
      .filter()
      .search(['flatNumber', 'block']);
    const totalResults = await countFeatures.query.countDocuments();

    // Query features
    const features = new APIFeatures(Flat.find(), req.query)
      .filter()
      .search(['flatNumber', 'block'])
      .sort()
      .limitFields()
      .paginate();

    const flats = await features.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    res.status(200).json({
      message: 'success',
      totalResults,
      totalPages: Math.ceil(totalResults / limit),
      page,
      limit,
      data: flats,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFlatById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('flat')
    console.log(user)
    // const flat = await Flat.findById(req.params.id);
    // if (!flat) return res.status(404).json({ message: 'Flat not found' });
    res.status(200).json({ data: user.flat });
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const updateFlat = async (req, res) => {
  try {
    const updatedFlat = await Flat.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedFlat) return res.status(404).json({ message: 'Flat not found' });
    res.status(200).json({
      message: 'Flat updated successfully',
      data: updatedFlat,
    });
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const deleteFlat = async (req, res) => {
  try {
    const deletedFlat = await Flat.findByIdAndDelete(req.params.id);
    if (!deletedFlat) return res.status(404).json({ message: 'Flat not found' });
    res.status(200).json({ message: 'Flat deleted successfully' });
  } catch (error) {
    res.json({ error: error.message });
  }
};

export const getAvailableFlats = async (req, res) => {
  try {
    const availableFlats = await Flat.find({ isOccupied: false });
    res.status(200).json({ data: availableFlats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// /api/v1/users/:userId/assign-flat ;
// flat id = req.body
// roles avaialbe => ai => authSlice => role state ui rendering admin => admin dashboard ==> role = resident dashbaord =