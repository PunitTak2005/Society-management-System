import 'dotenv/config';
import mongoose from 'mongoose';

// Import models
import User from './model/user.model.js';
import Role from './model/role.model.js';

// Import utility functions
import { generatePassword } from './lib/generatePassword.js';
import { generateHash } from './lib/hashPassword.js';
import transporter from './lib/sendMail.js';
import { newUserRegistrationTemplate } from './templates/NewUserRegistration.js';
import connectDb from './db/config.js';

const seedAdminUser = async () => {
  try {
    await connectDb();

    const myRealEmail = 'punittak2005@gmail.com';
    const myName = 'Admin User';

    let adminRole = await Role.findOne({ role: 'admin' });
    if (!adminRole) {
      adminRole = await Role.create({
        role: 'admin',
        roleDescription: 'System Administrator'
      });
      console.log('✅ Admin role created.');
    }

    // Clean up the previous failed attempt from the database
    await User.deleteOne({ email: myRealEmail });

    const plainTextPassword = generatePassword(8);
    const hashedPassword = await generateHash(plainTextPassword);

    const newUser = await User.create({
      name: myName,
      email: myRealEmail,
      phone: 9876543210,
      role: adminRole._id,
      password: hashedPassword,
      isActive: true
    });

    console.log(`✅ User saved to DB. Preparing to send email to ${myRealEmail}...`);

    await transporter.sendMail({
      from: `SMS TEAM <${process.env.SMTP_USER}>`,
      to: newUser.email,
      subject: 'Welcome to Society Management System - Admin Login',
      html: newUserRegistrationTemplate(plainTextPassword, newUser.name),
    });

    console.log('🚀 Success! Check your email inbox for your new password.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating user or sending email:', error);
    process.exit(1);
  }
};

seedAdminUser();
