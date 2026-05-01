import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './src/models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to Database');

    const adminExists = await User.findOne({ email: 'admin@company.com' });
    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('admin123', salt);

    const admin = await User.create({
      name: 'Super Admin',
      email: 'admin@company.com',
      passwordHash: passwordHash,
      role: 'superadmin',
      company: null
    });

    console.log('🎉 Super Admin Created Successfully!');
    console.log('Email: admin@company.com');
    console.log('Password: admin123');
    console.log('\nNow you can login in frontend.');

  } catch (error) {
    console.error('❌ Seed Error:', error.message);
  } finally {
    process.exit(0);
  }
};

seedAdmin();