import Bill from '../model/bill.model.js';
import Flat from '../model/flat.model.js';
import User from '../model/user.model.js';
import APIFeatures from '../lib/apiFeatures.js';

export const createBill = async (req, res) => {
  try {
    const { flatId, title, amount, dueDate } = req.body;

    if (!flatId || !title || !amount || !dueDate) {
      return res.status(400).json({ message: 'All billing fields are required.' });
    }

    const flat = await Flat.findById(flatId);
    if (!flat) {
      return res.status(404).json({ message: 'Flat not found.' });
    }

    const resident = await User.findOne({ flat: flatId, isActive: true });
    if (!resident) {
      return res.status(400).json({ 
        message: 'No active resident is currently registered to this flat. Please assign a user first.' 
      });
    }

    const bill = await Bill.create({
      flat: flatId,
      resident: resident._id,
      title,
      amount,
      dueDate,
      status: 'unpaid',
    });

    res.status(201).json({
      message: 'Bill issued successfully.',
      data: bill,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBills = async (req, res) => {
  try {
    let baseQuery = Bill.find();

    if (req.user.role === 'resident') {
      baseQuery = Bill.find({ resident: req.user.id });
    }

    const countFeatures = new APIFeatures(baseQuery.clone(), req.query)
      .filter()
      .search(['title']);
    const totalResults = await countFeatures.query.countDocuments();

    const features = new APIFeatures(baseQuery, req.query)
      .filter()
      .search(['title'])
      .sort()
      .paginate();

    const bills = await features.query
      .populate('flat', 'flatNumber block floor')
      .populate('resident', 'name email phone');

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    res.status(200).json({
      message: 'success',
      totalResults,
      totalPages: Math.ceil(totalResults / limit),
      page,
      limit,
      data: bills,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const payBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required.' });
    }

    const bill = await Bill.findById(id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found.' });
    }

    if (req.user.role === 'resident' && bill.resident.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied: Cannot pay another resident\'s bill.' });
    }

    if (bill.status === 'paid') {
      return res.status(400).json({ message: 'This bill has already been paid.' });
    }

    const mockTxn = `TXN-${Date.now()}-${Math.floor(10000 + Math.random() * 90000)}`;

    bill.status = 'paid';
    bill.paymentDate = new Date();
    bill.transactionId = mockTxn;
    bill.paymentMethod = paymentMethod;

    await bill.save();

    res.status(200).json({
      message: 'Payment processed successfully.',
      data: bill,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBillStats = async (req, res) => {
  try {
    const totalBilled = await Bill.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalCollected = await Bill.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const unpaidCount = await Bill.countDocuments({ status: { $ne: 'paid' } });
    const paidCount = await Bill.countDocuments({ status: 'paid' });

    const billedSum = totalBilled[0]?.total || 0;
    const collectedSum = totalCollected[0]?.total || 0;
    const outstandingSum = billedSum - collectedSum;

    res.status(200).json({
      message: 'success',
      data: {
        totalBilled: billedSum,
        totalCollected: collectedSum,
        totalOutstanding: outstandingSum,
        unpaidCount,
        paidCount,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
