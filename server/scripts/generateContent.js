require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../utils/logger');
const aiService = require('../services/aiService');

const syllabus = {
  'Introduction to Python Programming': {
    difficulty: 'beginner',
    modules: [
      {
        title: 'Python Basics & Setup',
        order: 1,
        description: 'Install Python, understand variables, data types, and basic operators',
        lessons: [
          { title: 'Installing Python & IDE Setup', contentType: 'text', textContent: 'Step-by-step guide to installing Python 3 and setting up VS Code with Python extensions. Covers virtual environments and pip package manager.' },
          { title: 'Variables & Data Types', contentType: 'text', textContent: 'Deep dive into Python variables, integers, floats, strings, booleans, and type() function. Dynamic typing explained with examples.' },
          { title: 'Operators & Expressions', contentType: 'text', textContent: 'Arithmetic, comparison, logical, assignment, bitwise, and membership operators. Operator precedence with practical examples.' },
          { title: 'String Manipulation', contentType: 'text', textContent: 'String methods, slicing, formatting with f-strings, concatenation, escape sequences, and multi-line strings.' },
        ],
      },
      {
        title: 'Control Flow',
        order: 2,
        description: 'Conditional statements and loops to control program execution',
        lessons: [
          { title: 'If-Else Statements', contentType: 'text', textContent: 'Conditional logic with if, elif, else. Nested conditions, ternary operator, and truthy/falsy values in Python.' },
          { title: 'For Loops', contentType: 'text', textContent: 'Iterating over sequences with for loops. Range function, enumerate, zip, and loop else clause.' },
          { title: 'While Loops', contentType: 'text', textContent: 'While loops, break/continue/pass, infinite loops, and do-while alternatives. Practical examples.' },
          { title: 'List Comprehensions', contentType: 'text', textContent: 'List comprehensions syntax, nested comprehensions, conditional comprehensions, and comparison with traditional loops.' },
        ],
      },
      {
        title: 'Functions & Modules',
        order: 3,
        description: 'Write reusable code with functions and organize with modules',
        lessons: [
          { title: 'Defining Functions', contentType: 'text', textContent: 'Function definition with def, parameters, return values, docstrings, and type hints.' },
          { title: 'Scope & Arguments', contentType: 'text', textContent: 'Local vs global scope, *args and **kwargs, default arguments, keyword-only arguments, and lambda functions.' },
          { title: 'Modules & Packages', contentType: 'text', textContent: 'Importing modules, creating custom modules, __name__ == "__main__", pip, and popular standard library modules.' },
          { title: 'Error Handling', contentType: 'text', textContent: 'Try-except blocks, multiple exceptions, finally/else clauses, custom exceptions, and logging best practices.' },
        ],
      },
      {
        title: 'Data Structures',
        order: 4,
        description: 'Master Python built-in data structures',
        lessons: [
          { title: 'Lists & Tuples', contentType: 'text', textContent: 'List methods, slicing, sorting, nested lists. Tuples: immutability, packing/unpacking, namedtuples.' },
          { title: 'Dictionaries & Sets', contentType: 'text', textContent: 'Dictionary operations, dict comprehensions, defaultdict, Counter. Sets: union, intersection, difference.' },
          { title: 'Working with Files', contentType: 'text', textContent: 'Reading/writing files, context managers (with), CSV processing, JSON serialization, and file paths with pathlib.' },
        ],
      },
      {
        title: 'Object-Oriented Programming',
        order: 5,
        description: 'Learn OOP concepts with Python classes',
        lessons: [
          { title: 'Classes & Objects', contentType: 'text', textContent: 'Class definition, __init__ method, self parameter, instance/class/static methods, and properties with @property.' },
          { title: 'Inheritance & Polymorphism', contentType: 'text', textContent: 'Single inheritance, super(), method overriding, multiple inheritance, MRO, and abstract base classes.' },
          { title: 'Magic Methods & Dunder', contentType: 'text', textContent: '__str__, __repr__, __len__, __eq__, operator overloading, context managers with __enter__/__exit__.' },
        ],
      },
    ],
  },
  'Advanced JavaScript & React': {
    difficulty: 'advanced',
    modules: [
      {
        title: 'Modern ES6+ JavaScript',
        order: 1,
        description: 'Master modern JavaScript features',
        lessons: [
          { title: 'Arrow Functions & Template Literals', contentType: 'text', textContent: 'Arrow function syntax, lexical this binding, template literals with expressions, tagged templates.' },
          { title: 'Destructuring & Spread', contentType: 'text', textContent: 'Array and object destructuring, default values, rest parameters, spread operator for arrays and objects.' },
          { title: 'Modules & Imports', contentType: 'text', textContent: 'ES6 modules, named vs default exports, dynamic imports, import maps, tree shaking concepts.' },
          { title: 'Maps, Sets & Symbols', contentType: 'text', textContent: 'Map and Set data structures, WeakMap/WeakSet, Symbol primitive, iterators and generators.' },
        ],
      },
      {
        title: 'Asynchronous JavaScript',
        order: 2,
        description: 'Handle async operations with promises and async/await',
        lessons: [
          { title: 'Callbacks & Promises', contentType: 'text', textContent: 'Callback pattern, Promise constructor, .then/.catch, Promise.all/race/allSettled, error handling.' },
          { title: 'Async/Await', contentType: 'text', textContent: 'Async functions, await keyword, error handling with try-catch, sequential vs parallel execution.' },
          { title: 'Fetch API & AJAX', contentType: 'text', textContent: 'Fetch API, HTTP methods, headers, error handling, AbortController, and working with JSON APIs.' },
        ],
      },
      {
        title: 'React Core Concepts',
        order: 3,
        description: 'Build UIs with React components',
        lessons: [
          { title: 'JSX & Components', contentType: 'text', textContent: 'JSX syntax, functional components, props, children, key prop, and component composition patterns.' },
          { title: 'State & Effects', contentType: 'text', textContent: 'useState hook, useEffect hook, dependency arrays, cleanup functions, custom hooks creation.' },
          { title: 'Event Handling & Forms', contentType: 'text', textContent: 'Synthetic events, form handling, controlled vs uncontrolled components, useRef hook.' },
        ],
      },
      {
        title: 'Advanced React Patterns',
        order: 4,
        description: 'Learn advanced React patterns and state management',
        lessons: [
          { title: 'Context API & useReducer', contentType: 'text', textContent: 'React.createContext, useContext hook, useReducer for complex state, context with reducer pattern.' },
          { title: 'React Router', contentType: 'text', textContent: 'React Router v6, route configuration, nested routes, lazy loading with Suspense, navigation guards.' },
          { title: 'Performance Optimization', contentType: 'text', textContent: 'React.memo, useMemo, useCallback, code splitting, virtualization with react-window, profiling.' },
        ],
      },
    ],
  },
  'Data Science & Machine Learning': {
    difficulty: 'intermediate',
    modules: [
      {
        title: 'Python for Data Science',
        order: 1,
        description: 'Essential Python libraries for data analysis',
        lessons: [
          { title: 'NumPy Fundamentals', contentType: 'text', textContent: 'NumPy arrays, array operations, broadcasting, indexing slicing, linear algebra operations, random module.' },
          { title: 'Pandas DataFrames', contentType: 'text', textContent: 'Series and DataFrame creation, reading CSV/Excel, data cleaning, groupby operations, merge/join.' },
          { title: 'Data Cleaning & Preprocessing', contentType: 'text', textContent: 'Handling missing values, outlier detection, data normalization, encoding categorical variables, feature scaling.' },
        ],
      },
      {
        title: 'Statistics & Probability',
        order: 2,
        description: 'Statistical foundations for ML',
        lessons: [
          { title: 'Descriptive Statistics', contentType: 'text', textContent: 'Mean, median, mode, variance, standard deviation, quartiles, skewness, kurtosis with Python examples.' },
          { title: 'Probability Distributions', contentType: 'text', textContent: 'Normal, binomial, Poisson distributions. Central Limit Theorem, confidence intervals, p-values.' },
          { title: 'Hypothesis Testing', contentType: 'text', textContent: 'Null and alternative hypotheses, t-tests, chi-square tests, ANOVA, Type I/II errors, statistical significance.' },
        ],
      },
      {
        title: 'Data Visualization',
        order: 3,
        description: 'Create compelling data visualizations',
        lessons: [
          { title: 'Matplotlib Essentials', contentType: 'text', textContent: 'Line plots, scatter plots, bar charts, histograms, subplots, customizing styles and saving figures.' },
          { title: 'Seaborn for Statistical Plots', contentType: 'text', textContent: 'Distribution plots, categorical plots, regression plots, heatmaps, pairplots, themes and palettes.' },
          { title: 'Interactive Visualizations', contentType: 'text', textContent: 'Plotly Express basics, interactive charts, dashboards with plotly dash, exporting to HTML.' },
        ],
      },
      {
        title: 'Machine Learning Algorithms',
        order: 4,
        description: 'Implement ML algorithms with scikit-learn',
        lessons: [
          { title: 'Supervised Learning: Regression', contentType: 'text', textContent: 'Linear regression, polynomial regression, regularization (Ridge/Lasso/ElasticNet), evaluation metrics.' },
          { title: 'Supervised Learning: Classification', contentType: 'text', textContent: 'Logistic regression, decision trees, random forests, SVM, KNN, confusion matrix, ROC curves.' },
          { title: 'Unsupervised Learning', contentType: 'text', textContent: 'K-means clustering, hierarchical clustering, DBSCAN, PCA for dimensionality reduction, t-SNE.' },
        ],
      },
    ],
  },
  'Full Stack Web Development': {
    difficulty: 'intermediate',
    modules: [
      {
        title: 'Frontend Fundamentals',
        order: 1,
        description: 'HTML5, CSS3 and responsive design',
        lessons: [
          { title: 'HTML5 Semantics & Structure', contentType: 'text', textContent: 'Semantic HTML elements, forms and validation, accessibility (ARIA), SEO meta tags.' },
          { title: 'CSS3 Flexbox & Grid', contentType: 'text', textContent: 'Flexbox layout model, CSS Grid, responsive design with media queries, CSS custom properties.' },
          { title: 'CSS Preprocessors & Frameworks', contentType: 'text', textContent: 'SASS/SCSS features, Bootstrap 5 utility classes, Tailwind CSS setup and configuration.' },
        ],
      },
      {
        title: 'JavaScript for Web',
        order: 2,
        description: 'DOM manipulation and browser APIs',
        lessons: [
          { title: 'DOM Manipulation', contentType: 'text', textContent: 'Selecting elements, traversing DOM, modifying content/styles, event listeners, event delegation.' },
          { title: 'Browser APIs', contentType: 'text', textContent: 'LocalStorage, SessionStorage, Geolocation API, Canvas, Web Workers, Service Workers basics.' },
          { title: 'Async Web Patterns', contentType: 'text', textContent: 'Fetch API, async/await with DOM, loading states, error handling UX, infinite scroll pattern.' },
        ],
      },
      {
        title: 'Backend with Node.js & Express',
        order: 3,
        description: 'Build RESTful APIs with Node.js',
        lessons: [
          { title: 'Node.js Basics', contentType: 'text', textContent: 'Event loop, module system, file system, streams, buffers, process management, environment variables.' },
          { title: 'Express.js Framework', contentType: 'text', textContent: 'Routing, middleware, request/response handling, error handling, template engines (EJS/Pug).' },
          { title: 'RESTful API Design', contentType: 'text', textContent: 'REST principles, CRUD operations, status codes, API versioning, pagination, filtering, documentation.' },
        ],
      },
      {
        title: 'Database with MongoDB',
        order: 4,
        description: 'NoSQL database design and implementation',
        lessons: [
          { title: 'MongoDB Fundamentals', contentType: 'text', textContent: 'Documents, collections, CRUD operations, indexing, aggregation pipeline, Atlas.' },
          { title: 'Mongoose ODM', contentType: 'text', textContent: 'Schema design, models, validators, middleware (pre/post hooks), population, virtuals.' },
          { title: 'Authentication & Authorization', contentType: 'text', textContent: 'JWT tokens, bcrypt hashing, OAuth2, role-based access, session management, security best practices.' },
        ],
      },
    ],
  },
  'UI/UX Design Fundamentals': {
    difficulty: 'beginner',
    modules: [
      {
        title: 'Design Principles',
        order: 1,
        description: 'Core design principles and color theory',
        lessons: [
          { title: 'Principles of Design', contentType: 'text', textContent: 'Balance, contrast, emphasis, movement, pattern, rhythm, unity. Gestalt principles and their application.' },
          { title: 'Color Theory', contentType: 'text', textContent: 'Color wheel, color harmony schemes, psychology of colors, accessibility (WCAG contrast ratios).' },
          { title: 'Typography', contentType: 'text', textContent: 'Type classification, font pairing, hierarchy, readability, web fonts, responsive typography.' },
        ],
      },
      {
        title: 'User Research',
        order: 2,
        description: 'Understand users through research methods',
        lessons: [
          { title: 'Research Methods', contentType: 'text', textContent: 'User interviews, surveys, competitive analysis, analytics review, contextual inquiry.' },
          { title: 'User Personas & Journeys', contentType: 'text', textContent: 'Creating personas, empathy maps, user journey maps, storyboarding, scenario mapping.' },
          { title: 'Information Architecture', contentType: 'text', textContent: 'Card sorting, sitemaps, navigation design, content hierarchy, labeling systems, search patterns.' },
        ],
      },
      {
        title: 'Wireframing & Prototyping',
        order: 3,
        description: 'Create wireframes and interactive prototypes',
        lessons: [
          { title: 'Sketching & Wireframing', contentType: 'text', textContent: 'Low-fidelity wireframes, paper prototyping, digital wireframes with Figma/Adobe XD, grid systems.' },
          { title: 'Interactive Prototyping', contentType: 'text', textContent: 'Clickable prototypes, micro-interactions, transitions, prototyping tools, fidelity levels.' },
          { title: 'Design Systems', contentType: 'text', textContent: 'Component libraries, style guides, design tokens, atomic design methodology, Storybook documentation.' },
        ],
      },
      {
        title: 'Usability Testing',
        order: 4,
        description: 'Test and validate designs with users',
        lessons: [
          { title: 'Testing Methods', contentType: 'text', textContent: 'Moderated vs unmoderated tests, A/B testing, remote testing, guerrilla testing, eye tracking.' },
          { title: 'Analyzing Results', contentType: 'text', textContent: 'Task success rate, time on task, SUS score, NPS, heatmaps, click maps, session recordings.' },
          { title: 'Iterative Design', contentType: 'text', textContent: 'Feedback incorporation, design iteration cycles, version control for designers, handoff to developers.' },
        ],
      },
    ],
  },
};

function generateModuleNotes(courseTitle, moduleTitle, lessons) {
  const lessonContent = lessons.map(l => l.title).join(', ');
  return `# ${moduleTitle}\n\n## Overview\nThis module covers ${moduleTitle.toLowerCase()} as part of the ${courseTitle} course.\n\n## Learning Objectives\n- Understand core concepts of ${moduleTitle.toLowerCase()}\n- Apply practical techniques in real-world scenarios\n- Build projects using the skills learned\n\n## Key Topics\n${lessons.map(l => `- **${l.title}**: ${l.textContent}`).join('\n')}\n\n## Key Takeaways\n- Master the fundamentals before moving to advanced topics\n- Practice with hands-on exercises for each lesson\n- Review and revise regularly for better retention\n\n## Practice Questions\n1. Explain the main concepts covered in this module\n2. Write code/examples demonstrating your understanding\n3. Build a small project incorporating these concepts`;
}

async function generateContent() {
  try {
    await mongoose.connect(config.mongodb.uri);
    logger.info('Connected to MongoDB for content generation');

    const Course = require('../models/Course');
    const Module = require('../models/Module');
    const Lesson = require('../models/Lesson');
    const Quiz = require('../models/Quiz');
    const Note = require('../models/Note');
    const User = require('../models/User');

    // Clear existing generated content
    await Module.deleteMany({});
    await Lesson.deleteMany({});
    await Quiz.deleteMany({});
    await Note.deleteMany({});

    const mentor = await User.findOne({ role: 'mentor' });
    if (!mentor) { logger.error('No mentor found'); process.exit(1); }

    const courses = await Course.find();
    let totalQuizzes = 0;
    let totalNotes = 0;

    for (const course of courses) {
      const courseSlug = course.title;
      const courseData = syllabus[courseSlug];
      if (!courseData) {
        logger.warn(`No syllabus for ${courseSlug}, skipping`);
        continue;
      }

      logger.info(`\n=== Processing: ${courseSlug} ===`);
      const courseModuleIds = [];

      for (const modData of courseData.modules) {
        // Create Module
        const mod = await Module.create({
          title: modData.title,
          description: modData.description,
          course: course._id,
          order: modData.order,
          isPublished: true,
          createdBy: mentor._id,
        });

        // Create Lessons
        for (const lessonData of modData.lessons) {
          await Lesson.create({
            title: lessonData.title,
            module: mod._id,
            course: course._id,
            order: modData.lessons.indexOf(lessonData) + 1,
            contentType: lessonData.contentType || 'text',
            content: { textContent: lessonData.textContent || '' },
            isPublished: true,
            duration: 30,
            createdBy: mentor._id,
          });
        }

        // Track module for course
        courseModuleIds.push(mod._id);

        // Update module lesson count
        mod.lessons = (await Lesson.find({ module: mod._id })).map(l => l._id);
        await mod.save();

        // Generate Quiz for this module using AI service
        try {
          const quizData = await aiService.generateQuiz({
            topic: `${courseSlug}: ${modData.title}`,
            difficulty: courseData.difficulty || 'intermediate',
            count: 5,
            type: 'mcq',
            content: modData.description,
            timeLimit: 15,
          });

          const quiz = await Quiz.create({
            title: quizData.title || `${modData.title} Quiz`,
            description: quizData.description || `Test your knowledge of ${modData.title}`,
            course: course._id,
            module: mod._id,
            mentor: mentor._id,
            createdBy: mentor._id,
            questions: quizData.questions.map((q, i) => ({
              question: q.question || q.questionText || '',
              type: 'mcq',
              options: q.options || [],
              correctAnswer: q.correctAnswer || (q.options ? q.options[0] : ''),
              points: q.points || 5,
              explanation: q.explanation || '',
              order: i + 1,
            })),
            timeLimit: 15,
            passingScore: 40,
            maxAttempts: 3,
            isPublished: true,
            totalPoints: quizData.totalPoints || quizData.questions.reduce((s, q) => s + (q.points || 5), 0),
          });
          totalQuizzes++;
          logger.info(`  Quiz created: ${quiz.title}`);
        } catch (err) {
          logger.error(`  Quiz generation failed for ${modData.title}: ${err.message}`);
        }

        // Generate Notes for this module
        try {
          const notesContent = await generateModuleNotes(courseSlug, modData.title, modData.lessons);
          const note = await Note.create({
            title: `${modData.title} - Study Notes`,
            content: notesContent,
            course: course._id,
            module: mod._id,
            topic: modData.title,
            tags: [courseSlug.toLowerCase().replace(/[^a-z0-9]/g, '-'), modData.title.toLowerCase().replace(/[^a-z0-9]/g, '-')],
            isPublished: true,
            createdBy: mentor._id,
          });
          totalNotes++;
          logger.info(`  Notes created: ${note.title}`);
        } catch (err) {
          logger.error(`  Notes generation failed for ${modData.title}: ${err.message}`);
        }
      }

      // Update course with modules and total lessons
      course.modules = courseModuleIds;
      course.totalLessons = await Lesson.countDocuments({ course: course._id });
      await course.save();
      logger.info(`  Total lessons for ${courseSlug}: ${course.totalLessons}`);
    }

    logger.info(`\n========================================`);
    logger.info(`Generation complete!`);
    logger.info(`Modules: ${await Module.countDocuments()}`);
    logger.info(`Lessons: ${await Lesson.countDocuments()}`);
    logger.info(`Quizzes: ${totalQuizzes}`);
    logger.info(`Notes: ${totalNotes}`);
    logger.info(`========================================`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error('Generation error:', error);
    process.exit(1);
  }
}

generateContent();
