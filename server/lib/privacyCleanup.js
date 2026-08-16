import Visitor from '../model/visitors.model.js';


export const performPrivacyAnonymization = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await Visitor.updateMany(
      { 
        checkIn: { $lt: thirtyDaysAgo },
        $or: [
          { name: { $exists: true, $ne: "" } },
          { phone: { $exists: true } }
        ]
      },
      { 
        $unset: { name: "", phone: "" } 
      }
    );

    console.log(`🧹 GDPR Privacy Cleanup: Successfully anonymized ${result.modifiedCount} logs older than 30 days.`);
  } catch (error) {
    console.error('❌ GDPR Privacy Cleanup failed:', error.message);
  }
};


export const initPrivacyWorker = () => {
 
  performPrivacyAnonymization();


  setInterval(() => {
    performPrivacyAnonymization();
  }, 24 * 60 * 60 * 1000);
  
  console.log('⏰ GDPR Privacy Cleanup worker successfully registered.');
};
