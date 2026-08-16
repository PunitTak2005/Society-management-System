import User from '../model/user.model.js';
import Visitor from '../model/visitors.model.js';
import Flat from '../model/flat.model.js';
import notificationService from '../lib/notificationService.js';
import transporter from '../lib/sendMail.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import APIFeatures from '../lib/apiFeatures.js';

// ----------------------------------------------------
// TASK 1: Cryptographic invitations (Pre-Auth Passcode)
// ----------------------------------------------------

export const generatePreAuthPasscode = async (req, res) => {
  try {
    const { name, purpose, flatId, date, timeFrom, timeTo } = req.body;
    
    if (!name || !flatId || !date || !timeFrom || !timeTo) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Generate valid start and end dates from date and time window
    const validFrom = new Date(`${date}T${timeFrom}`);
    const validTo = new Date(`${date}T${timeTo}`);

    // Generate secure 6-digit passcode
    const passcode = Math.floor(100000 + Math.random() * 900000).toString();

    // Salt and hash the passcode
    const passcodeHash = await bcrypt.hash(passcode, 12);

    const visitor = await Visitor.create({
      name,
      type: 'guest',
      purpose: purpose || 'Guest Visit',
      flat: flatId,
      status: 'accepted', // Pre-authorized is accepted
      passcodeHash,
      passcodeValidFrom: validFrom,
      passcodeValidTo: validTo,
      isSingleUseUsed: false,
    });

    // Return the plaintext passcode to the resident (only this once)
    res.status(201).json({
      success: true,
      message: 'Invitation generated successfully',
      passcode,
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyPasscode = async (req, res) => {
  try {
    const { passcode } = req.body;

    if (!passcode) {
      return res.status(400).json({ message: 'Passcode is required.' });
    }

    // Query active pre-authorized invitations
    const visitors = await Visitor.find({
      type: 'guest',
      isSingleUseUsed: false,
      passcodeHash: { $exists: true },
    }).populate('flat');

    let matchingVisitor = null;

    // Use bcrypt to check hashes
    for (const v of visitors) {
      const match = await bcrypt.compare(passcode, v.passcodeHash);
      if (match) {
        matchingVisitor = v;
        break;
      }
    }

    if (!matchingVisitor) {
      return res.status(404).json({ message: 'Invalid passcode or already used.' });
    }

    const currentTime = new Date();
    
    // Check invite time window
    if (currentTime < matchingVisitor.passcodeValidFrom) {
      return res.status(400).json({ message: 'Invite window has not started yet.' });
    }

    if (currentTime > matchingVisitor.passcodeValidTo) {
      return res.status(400).json({ message: 'Invite window has expired.' });
    }

    // Update status and single use flag
    matchingVisitor.isSingleUseUsed = true;
    matchingVisitor.status = 'accepted';
    matchingVisitor.checkIn = new Date();
    await matchingVisitor.save();

    // Alert the guard's interface of the dynamic check-in
    notificationService.broadcast('visitor_status_updated', {
      visitorId: matchingVisitor._id,
      status: 'accepted',
      name: matchingVisitor.name,
      message: `Passcode verified! Guest "${matchingVisitor.name}" entered.`,
    });

    res.status(200).json({
      message: 'Passcode verified successfully. Entry approved.',
      data: matchingVisitor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----------------------------------------------------
// TASK 2: WebSocket walk-in approval flow & Inactive Fallback
// ----------------------------------------------------

// Triggers the fallback JWT signed email links
const triggerEmailFallback = async (visitor, resident) => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET_STRING || '4d0092e0853f1e8aa67ee8546275c787a13adbfdc8f178762649d1e0751ae070';
    
    // Generate secure tokens expiring in 5 mins
    const tokenApprove = jwt.sign({ visitorId: visitor._id, action: 'accepted' }, JWT_SECRET, { expiresIn: '5m' });
    const tokenReject = jwt.sign({ visitorId: visitor._id, action: 'rejected' }, JWT_SECRET, { expiresIn: '5m' });

    const approveLink = `http://localhost:3000/api/v1/visitors/email-action?token=${tokenApprove}`;
    const rejectLink = `http://localhost:3000/api/v1/visitors/email-action?token=${tokenReject}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: resident.email,
      subject: `🚨 Gatekeeper Action Required: Walk-in Visitor at your door!`,
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #0f172a; text-align: center; margin-bottom: 24px;">Gatekeeper Approval Request</h2>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hi <strong>${resident.name}</strong>,</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">A walk-in visitor is waiting at the guard station requesting entry to your flat:</p>
          
          <div style="background-color: #f8fafc; padding: 18px; border-radius: 8px; margin: 24px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px 0; color: #334155; font-size: 14px;"><strong>Visitor Name:</strong> ${visitor.name}</p>
            <p style="margin: 0 0 8px 0; color: #334155; font-size: 14px;"><strong>Type:</strong> <span style="text-transform: capitalize;">${visitor.type}</span></p>
            <p style="margin: 0; color: #334155; font-size: 14px;"><strong>Purpose:</strong> ${visitor.purpose || 'N/A'}</p>
          </div>

          <p style="color: #ef4444; font-size: 13px; font-weight: 500; text-align: center;">These links are secure and will expire in 5 minutes.</p>
          
          <div style="display: flex; gap: 16px; justify-content: center; margin: 28px 0;">
            <a href="${approveLink}" style="flex: 1; text-align: center; background-color: #10b981; color: white; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; border: 1px solid #059669; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Approve Entry</a>
            <a href="${rejectLink}" style="flex: 1; text-align: center; background-color: #ef4444; color: white; padding: 12px 24px; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px; border: 1px solid #dc2626; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Reject Entry</a>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
          <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">Best regards,<br>Society Management Gatekeeper</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✉️ Fallback email triggered and sent successfully to ${resident.email}`);
  } catch (err) {
    console.error('❌ Failed to send fallback email:', err.message);
  }
};

export const registerVisitor = async (req, res) => {
  try {
    const { name, type, phone, purpose, flatId, userId } = req.body;

    if (!name || !type || !flatId) {
      return res.status(400).json({ message: 'Name, Type, and Flat number are required.' });
    }

    // Find the resident assigned to that flat
    const resident = await User.findOne({ flat: flatId }).populate('role');
    if (!resident) {
      return res.status(404).json({ message: 'No active resident assigned to this flat.' });
    }

    // Create the visitor log with default 'pending' status
    const visitor = await Visitor.create({
      name,
      type,
      phone,
      flat: flatId,
      purpose: purpose || 'Visit',
      status: 'pending',
      registeredBy: userId,
    });

    // Check if the resident is actively connected on WebSockets
    const isResidentConnected = notificationService.sendToUser(resident._id, 'visitor_approval_request', {
      visitorId: visitor._id,
      name,
      type,
      purpose,
    });

    if (isResidentConnected) {
      // Set a 60-second fallback timer
      setTimeout(async () => {
        const checkVisitor = await Visitor.findById(visitor._id);
        if (checkVisitor && checkVisitor.status === 'pending') {
          console.log(`⏱️ 60s timeout reached for visitor ${visitor._id}. Activating email fallback...`);
          await triggerEmailFallback(checkVisitor, resident);
        }
      }, 60000);

      return res.status(201).json({
        message: 'Walk-in visitor registered. Approval request sent to resident.',
        data: visitor,
        waitingForApproval: true,
      });
    } else {
      // Resident is offline, trigger email fallback immediately
      console.log(`📴 Resident ${resident.name} is offline. Triggering instant email fallback...`);
      await triggerEmailFallback(visitor, resident);

      return res.status(201).json({
        message: 'Resident is offline. Notification email sent for approval.',
        data: visitor,
        waitingForApproval: true,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateVisitorStatus = async (req, res) => {
  try {
    const { visitorId, action } = req.body; // action: 'accepted' or 'rejected'

    if (!visitorId || !action) {
      return res.status(400).json({ message: 'VisitorId and Action are required.' });
    }

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor log not found.' });
    }

    visitor.status = action;
    if (action === 'accepted') {
      visitor.checkIn = new Date();
    }
    await visitor.save();

    // Alert the guard's panel of the resident's response
    notificationService.broadcast('visitor_status_updated', {
      visitorId: visitor._id,
      status: action,
      name: visitor.name,
      message: `Resident has ${action === 'accepted' ? 'approved' : 'rejected'} entry for "${visitor.name}".`,
    });

    res.status(200).json({
      message: `Visitor entry successfully ${action === 'accepted' ? 'approved' : 'rejected'}.`,
      data: visitor,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ----------------------------------------------------
// TASK 3: Inactive Resident Fallback Action Link Handler
// ----------------------------------------------------

export const emailActionHandler = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(`
        <div style="font-family: 'Inter', sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #ef4444;">Verification Token Missing</h2>
          <p>Please check your approval email again or ask the security guard to re-register the entry.</p>
        </div>
      `);
    }

    const JWT_SECRET = process.env.JWT_SECRET_STRING || '4d0092e0853f1e8aa67ee8546275c787a13adbfdc8f178762649d1e0751ae070';
    let decoded;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).send(`
        <div style="font-family: 'Inter', sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #ef4444;">Token Expired or Invalid</h2>
          <p>This verification link has expired (validity is 5 minutes). Please contact your security guard at the gate.</p>
        </div>
      `);
    }

    const { visitorId, action } = decoded;

    const visitor = await Visitor.findById(visitorId);
    if (!visitor) {
      return res.status(404).send(`
        <div style="font-family: 'Inter', sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #ef4444;">Visitor Record Not Found</h2>
          <p>We couldn't locate this visitor log in the database.</p>
        </div>
      `);
    }

    if (visitor.status !== 'pending') {
      return res.status(200).send(`
        <div style="font-family: 'Inter', sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #3b82f6;">Already Processed</h2>
          <p>This visitor log has already been updated to <strong>${visitor.status}</strong>.</p>
        </div>
      `);
    }

    visitor.status = action;
    if (action === 'accepted') {
      visitor.checkIn = new Date();
    }
    await visitor.save();

    // Alert the guard's station real-time
    notificationService.broadcast('visitor_status_updated', {
      visitorId: visitor._id,
      status: action,
      name: visitor.name,
      message: `Resident approved entry via Email for "${visitor.name}".`,
    });

    const isApprove = action === 'accepted';

    res.status(200).send(`
      <div style="font-family: 'Inter', sans-serif; text-align: center; padding: 50px; max-width: 500px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 50px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="font-size: 48px; margin-bottom: 20px;">${isApprove ? '✅' : '❌'}</div>
        <h2 style="color: ${isApprove ? '#10b981' : '#ef4444'}; margin-bottom: 12px;">Entry ${isApprove ? 'Approved' : 'Denied'}</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">You have successfully ${isApprove ? 'approved' : 'denied'} access for visitor <strong>${visitor.name}</strong>.</p>
        <p style="color: #64748b; font-size: 13px; margin-top: 24px;">The gatekeeper has been notified of your response.</p>
      </div>
    `);
  } catch (error) {
    res.status(500).send(`<p>Internal Server Error: ${error.message}</p>`);
  }
};

// GET ALL VISITOR LOGS
export const getVisitors = async (req, res) => {
  try {
    // Count matches for metadata
    const countFeatures = new APIFeatures(Visitor.find(), req.query)
      .filter()
      .search(['name', 'type', 'purpose']);
    const totalResults = await countFeatures.query.countDocuments();

    // Query features
    const features = new APIFeatures(Visitor.find(), req.query)
      .filter()
      .search(['name', 'type', 'purpose'])
      .sort()
      .paginate();

    const visitors = await features.query
      .populate('flat')
      .populate('registeredBy', 'name email');

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    res.status(200).json({
      message: 'success',
      totalResults,
      totalPages: Math.ceil(totalResults / limit),
      page,
      limit,
      data: visitors,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
