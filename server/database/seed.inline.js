const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Institute = require('../models/Institute');
const Course = require('../models/Course');
const Batch = require('../models/Batch');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Quiz = require('../models/Quiz');
const Note = require('../models/Note');

const seedInline = async () => {
  const institute = await Institute.create({
    name: 'Futura Labs Institute',
    email: 'info@futuralabs.com',
    phone: '+1-234-567-8900',
    address: { street: '123 Tech Street', city: 'San Francisco', state: 'CA', country: 'USA', zipCode: '94105' },
    subscription: { plan: 'premium', status: 'active' },
    settings: { allowStudentRegistration: true, maxStudents: 10000, maxMentors: 100 },
  });

  const superAdmin = await User.create({
    name: 'Super Admin', email: 'admin@futuralabs.com', password: 'Admin@123',
    role: 'super_admin', institute: institute._id, isVerified: true,
  });

  const admin = await User.create({
    name: 'Institute Admin', email: 'institute@futuralabs.com', password: 'Admin@123',
    role: 'admin', institute: institute._id, isVerified: true,
  });

  const mentors = await User.create([
    { name: 'John Mentor', email: 'john@futuralabs.com', password: 'Mentor@123', role: 'mentor', institute: institute._id, isVerified: true },
    { name: 'Sarah Mentor', email: 'sarah@futuralabs.com', password: 'Mentor@123', role: 'mentor', institute: institute._id, isVerified: true },
    { name: 'Mike Mentor', email: 'mike@futuralabs.com', password: 'Mentor@123', role: 'mentor', institute: institute._id, isVerified: true },
  ]);

  const students = await User.create([
    { name: 'Alice Student', email: 'alice@example.com', password: 'Student@123', role: 'student', institute: institute._id, isVerified: true },
    { name: 'Bob Student', email: 'bob@example.com', password: 'Student@123', role: 'student', institute: institute._id, isVerified: true },
    { name: 'Charlie Student', email: 'charlie@example.com', password: 'Student@123', role: 'student', institute: institute._id, isVerified: true },
    { name: 'Diana Student', email: 'diana@example.com', password: 'Student@123', role: 'student', institute: institute._id, isVerified: true },
    { name: 'Eve Student', email: 'eve@example.com', password: 'Student@123', role: 'student', institute: institute._id, isVerified: true },
  ]);

  const courses = await Course.create([
    {
      title: 'Introduction to Python Programming', description: 'Learn Python from scratch with hands-on projects',
      category: 'Programming', level: 'beginner', mentor: mentors[0]._id, institute: institute._id,
      isPublished: true, status: 'published', price: 0, isFree: true,
      tags: ['python', 'programming', 'beginner'], learningObjectives: ['Write Python code', 'Build applications', 'Understand OOP'],
    },
    {
      title: 'Advanced JavaScript & React', description: 'Master JavaScript and build modern React applications',
      category: 'Web Development', level: 'advanced', mentor: mentors[1]._id, institute: institute._id,
      isPublished: true, status: 'published', price: 4999, isFree: false,
      tags: ['javascript', 'react', 'frontend'], learningObjectives: ['Master ES6+', 'Build React apps', 'State management'],
    },
    {
      title: 'Data Science & Machine Learning', description: 'Comprehensive data science course with ML algorithms',
      category: 'Data Science', level: 'intermediate', mentor: mentors[2]._id, institute: institute._id,
      isPublished: true, status: 'published', price: 7999, isFree: false,
      tags: ['data-science', 'machine-learning', 'python'], learningObjectives: ['Data analysis', 'ML models', 'Deep learning'],
    },
    {
      title: 'Full Stack Web Development', description: 'Complete web development bootcamp covering MERN stack',
      category: 'Web Development', level: 'intermediate', mentor: mentors[0]._id, institute: institute._id,
      isPublished: true, status: 'published', price: 9999, isFree: false,
      tags: ['mern', 'fullstack', 'web'], learningObjectives: ['Build full stack apps', 'Deploy applications', 'APIs'],
    },
    {
      title: 'UI/UX Design Fundamentals', description: 'Learn design principles, Figma, and user experience',
      category: 'Design', level: 'beginner', mentor: mentors[1]._id, institute: institute._id,
      isPublished: true, status: 'published', price: 0, isFree: true,
      tags: ['design', 'ui-ux', 'figma'], learningObjectives: ['Design principles', 'Figma mastery', 'User research'],
    },
  ]);

  const batch = await Batch.create({
    name: 'Full Stack Cohort 2026', code: 'FS-2026', description: 'Full Stack Web Development Batch',
    institute: institute._id, mentor: mentors[0]._id, courses: courses.map(c => c._id),
    students: students.map(s => s._id), maxStudents: 30,
    startDate: new Date('2026-01-15'), endDate: new Date('2026-12-15'),
    schedule: { days: ['Monday', 'Wednesday', 'Friday'], startTime: '10:00', endTime: '12:00' },
    status: 'active',
  });

  await User.updateMany({ _id: { $in: students.map(s => s._id) } }, { batch: batch._id });

  for (const course of courses) {
    course.enrolledStudents = students.map(s => s._id);
    await course.save();
  }
  for (const student of students) {
    student.enrolledCourses = courses.map(c => c._id);
    await student.save({ validateBeforeSave: false });
  }

  const moduleTopics = {
    0: ['Python Basics', 'Data Types & Variables', 'Control Flow', 'Functions & Modules', 'Object-Oriented Python'],
    1: ['JavaScript ES6+', 'DOM Manipulation', 'React Fundamentals', 'State Management', 'Advanced Patterns'],
    2: ['Python for Data Science', 'Data Visualization', 'Statistical Analysis', 'Machine Learning Basics', 'Deep Learning Intro'],
    3: ['HTML/CSS Deep Dive', 'Node.js & Express', 'MongoDB & Mongoose', 'React Advanced', 'Deployment & DevOps'],
    4: ['Design Thinking', 'Figma Fundamentals', 'Color & Typography', 'Layout & Grids', 'Prototyping & Testing'],
  };

  for (let ci = 0; ci < courses.length; ci++) {
    const topics = moduleTopics[ci] || moduleTopics[0];
    for (let mi = 0; mi < topics.length; mi++) {
      const mod = await Module.create({
        title: topics[mi], description: `Module covering ${topics[mi]}`,
        course: courses[ci]._id, order: mi, isPublished: true,
      });

      await Lesson.create({
        title: `${topics[mi]} - Overview`, description: `Introduction to ${topics[mi]}`,
        course: courses[ci]._id, module: mod._id, order: 0, isPublished: true,
        content: { textContent: `Detailed content about ${topics[mi]}. This lesson covers the fundamental concepts and practical applications.` },
        duration: 30,
      });

      await Quiz.create({
        title: `${topics[mi]} Quiz`, description: `Test your knowledge of ${topics[mi]}`,
        course: courses[ci]._id, module: mod._id, mentor: mentors[ci % 3]._id,
        createdBy: mentors[ci % 3]._id, isPublished: true, timeLimit: 15, passingScore: 40,
        totalPoints: 10,
        questions: [
          {
            question: `What is the main focus of ${topics[mi]}?`,
            type: 'mcq', options: ['Core concepts', 'Advanced theory', 'History', 'None of the above'],
            correctAnswer: 'Core concepts', explanation: `The main focus is on core concepts of ${topics[mi]}.`,
            points: 5, order: 0,
          },
          {
            question: `Which of the following is most relevant to ${topics[mi]}?`,
            type: 'mcq', options: ['Practical application', 'Memorization', 'Nothing', 'Guessing'],
            correctAnswer: 'Practical application', explanation: `Practical application is key in ${topics[mi]}.`,
            points: 5, order: 1,
          },
        ],
      });

      await Note.create({
        title: `Study Notes: ${topics[mi]}`, content: `Comprehensive study notes for ${topics[mi]}. Key concepts, formulas, and examples to help you prepare for assessments.`,
        course: courses[ci]._id, module: mod._id, author: mentors[ci % 3]._id, isPublished: true,
      });
    }
  }

  console.log('Seed complete');
};

module.exports = seedInline();
