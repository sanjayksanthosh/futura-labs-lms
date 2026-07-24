require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config');
const logger = require('../utils/logger');

const seed = async () => {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB for seeding');

    const User = require('../models/User');
    const Institute = require('../models/Institute');
    const Course = require('../models/Course');
    const Batch = require('../models/Batch');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Institute.deleteMany({}),
      Course.deleteMany({}),
      Batch.deleteMany({}),
    ]);

    // Create Institute
    const institute = await Institute.create({
      name: 'Futura Labs Institute',
      email: 'info@futuralabs.com',
      phone: '+1-234-567-8900',
      address: { street: '123 Tech Street', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94105' },
      subscription: { plan: 'premium', status: 'active' },
      settings: { allowStudentRegistration: true, maxStudents: 10000, maxMentors: 100 },
    });

    // Create Super Admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@futuralabs.com',
      password: 'Admin@123',
      role: 'super_admin',
      institute: institute._id,
      isVerified: true,
    });

    const admin = await User.create({
      name: 'Institute Admin',
      email: 'institute@futuralabs.com',
      password: 'Admin@123',
      role: 'admin',
      institute: institute._id,
      isVerified: true,
    });

    // Create Mentors
    const mentors = await User.create([
      { name: 'John Mentor', email: 'john@futuralabs.com', password: 'Mentor@123', role: 'mentor', institute: institute._id, isVerified: true },
      { name: 'Sarah Mentor', email: 'sarah@futuralabs.com', password: 'Mentor@123', role: 'mentor', institute: institute._id, isVerified: true },
      { name: 'Mike Mentor', email: 'mike@futuralabs.com', password: 'Mentor@123', role: 'mentor', institute: institute._id, isVerified: true },
    ]);

    // Create Students
    const students = await User.create([
      { name: 'Alice Student', email: 'alice@example.com', password: 'Student@123', role: 'student', institute: institute._id, isVerified: true },
      { name: 'Bob Student', email: 'bob@example.com', password: 'Student@123', role: 'student', institute: institute._id, isVerified: true },
      { name: 'Charlie Student', email: 'charlie@example.com', password: 'Student@123', role: 'student', institute: institute._id, isVerified: true },
      { name: 'Diana Student', email: 'diana@example.com', password: 'Student@123', role: 'student', institute: institute._id, isVerified: true },
      { name: 'Eve Student', email: 'eve@example.com', password: 'Student@123', role: 'student', institute: institute._id, isVerified: true },
    ]);

    // Create Courses
    const courses = await Course.create([
      {
        title: 'Introduction to Python Programming',
        description: 'Learn Python from scratch with hands-on projects',
        category: 'Programming',
        level: 'beginner',
        mentor: mentors[0]._id,
        institute: institute._id,
        isPublished: true,
        status: 'published',
        price: 0,
        isFree: true,
        tags: ['python', 'programming', 'beginner'],
        learningObjectives: ['Write Python code', 'Build applications', 'Understand OOP'],
      },
      {
        title: 'Advanced JavaScript & React',
        description: 'Master JavaScript and build modern React applications',
        category: 'Web Development',
        level: 'advanced',
        mentor: mentors[1]._id,
        institute: institute._id,
        isPublished: true,
        status: 'published',
        price: 4999,
        isFree: false,
        tags: ['javascript', 'react', 'frontend'],
        learningObjectives: ['Master ES6+', 'Build React apps', 'State management'],
      },
      {
        title: 'Data Science & Machine Learning',
        description: 'Comprehensive data science course with ML algorithms',
        category: 'Data Science',
        level: 'intermediate',
        mentor: mentors[2]._id,
        institute: institute._id,
        isPublished: true,
        status: 'published',
        price: 7999,
        isFree: false,
        tags: ['data-science', 'machine-learning', 'python'],
        learningObjectives: ['Data analysis', 'ML models', 'Deep learning'],
      },
      {
        title: 'Full Stack Web Development',
        description: 'Complete web development bootcamp covering MERN stack',
        category: 'Web Development',
        level: 'intermediate',
        mentor: mentors[0]._id,
        institute: institute._id,
        isPublished: true,
        status: 'published',
        price: 9999,
        isFree: false,
        tags: ['mern', 'fullstack', 'web'],
        learningObjectives: ['Build full stack apps', 'Deploy applications', 'APIs'],
      },
      {
        title: 'UI/UX Design Fundamentals',
        description: 'Learn design principles, Figma, and user experience',
        category: 'Design',
        level: 'beginner',
        mentor: mentors[1]._id,
        institute: institute._id,
        isPublished: true,
        status: 'published',
        price: 0,
        isFree: true,
        tags: ['design', 'ui-ux', 'figma'],
        learningObjectives: ['Design principles', 'Figma mastery', 'User research'],
      },
    ]);

    // Create Batch
    const batch = await Batch.create({
      name: 'Full Stack Cohort 2026',
      code: 'FS-2026',
      description: 'Full Stack Web Development Batch',
      institute: institute._id,
      mentor: mentors[0]._id,
      courses: courses.map((c) => c._id),
      students: students.map((s) => s._id),
      maxStudents: 30,
      startDate: new Date('2026-01-15'),
      endDate: new Date('2026-12-15'),
      schedule: { days: ['Monday', 'Wednesday', 'Friday'], startTime: '10:00', endTime: '12:00' },
      status: 'active',
    });

    // Update students with batch
    await User.updateMany({ _id: { $in: students.map((s) => s._id) } }, { batch: batch._id });

    // Enroll students in courses
    for (const course of courses) {
      course.enrolledStudents = students.map((s) => s._id);
      await course.save();
    }

    // Update students enrolled courses
    for (const student of students) {
      student.enrolledCourses = courses.map((c) => c._id);
      await student.save({ validateBeforeSave: false });
    }

    logger.info('========================================');
    logger.info('Database seeded successfully!');
    logger.info('========================================');
    logger.info('Super Admin: admin@futuralabs.com / Admin@123');
    logger.info('Admin: institute@futuralabs.com / Admin@123');
    logger.info('Mentor: john@futuralabs.com / Mentor@123');
    logger.info('Student: alice@example.com / Student@123');
    logger.info('========================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
